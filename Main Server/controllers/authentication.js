const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const users = require('../models/Users');
const userMetadata = require('../models/User_metadata');
const { validationResult } = require('express-validator');
const helper = require('../util/helper');
const crypto = require('crypto');


exports.login = async (req, res) => {
    // check if the request body is valid
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.sendStatus(400);
    }

    const { email, password } = req.body;

    // check if the email exists
    const user = await userMetadata.findOne({
        where: {
            email: email
        },
        include: [{
            model: users,
            attributes: ['id', 'name', 'banned']
        }],
        attributes: ['password', 'email_verified']
    });

    // check if the password is correct, email is verified and user is not banned
    if (!user || !(await bcrypt.compare(password, user.password)) || !user.email_verified || user.banned) {
        return res.sendStatus(400);
    }

    // create a token and send it to the client
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: '1h'
    });

    res.status(200).json({ token: token });
};

exports.register = async (req, res) => {

    // check if the request body is valid
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;
    let promises = [];
    
    // check if the email already exists
    const check = userMetadata.findOne({
        where: {
            email: email
        },
        attributes: ['email']
    });
    promises.push(check);

    // hash the password
    const hashedPassword = promises.push(bcrypt.hash(password, 10));


    // wait for all promises to resolve
    await Promise.all(promises);


    if(check) {
        return res.status(400).json({ errors: [{ msg: 'Email already exists', path: 'email' }] });
    }

    // save user to the database
    let user = await users.create({
        name: name,
        bio: req.body.bio,
        profile_pic: req.body.profile_pic,
    });

    // save meta data of the user to the database
    user = await userMetadata.create({
        id: user.id,
        email: email,
        password: hashedPassword,
        verification_code: crypto.randomInt(100000, 999999)
    });

    // send email to the user with the verification code
    helper.sendEmail(
        'Email verification', 
        `This is your verification code you will not be able to use the account till you verify you email ${user.verification_code}`, 
        `This is your verification code you will not be able to use the account till you verify you email <b>${user.verification_code}</b>`,
        user.email
    );

    res.sendStatus(201);
};

exports.forgotPassword = async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.sendStatus(400);
    }

    const { email } = req.body;

    // check if the email exists
    const user = await userMetadata.findOne({
        where: {
            email: email
        },
        attributes: ['id', 'email']
    });

    // create a reset password token
    const token = crypto.randomInt(100000, 999999);

    // send email to the user with the reset password token
    if (user) {
        helper.sendEmail('Forgot password.', `This is the reset password code ${token}`, `This is the reset password code <b>${token}</b>`, user.email);
    }

    res.sendStatus(200);
};

exports.verifyResetPasswordToken = async (req, res) => {
    // check if the request body is valid
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.sendStatus(400);
    }

    const { token, email } = req.body;

    // check if the token exists
    const user = await userMetadata.findOne({
        where: {
            email: email
        },
        attributes: ['id', 'reset_password_token']
    });

    if (!user || user.reset_password_token !== token) {
        return res.sendStatus(400);
    }

    res.sendStatus(200);
};

exports.resetPassword = async (req, res) => {
    // check if the request body is valid
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.sendStatus(400);
    }

    const { token, password, email } = req.body;

    // check if the token exists
    const user = await userMetadata.findOne({
        where: {
            email: email
        },
        attributes: ['id', 'email', 'reset_password_token', 'password']
    });

    if (!user || user.reset_password_token !== token) {
        return res.sendStatus(400);
    }

    // hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // update user
    user.password = hashedPassword;
    user.reset_password_token = null;
    await user.save();

    res.sendStatus(200);
};

exports.verifyEmail = async (req, res) => {
    // check if the request body is valid
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.sendStatus(400);
    }

    const { code, email } = req.body;

    // check if the email exists and code is correct
    const user = await userMetadata.findOne({
        where: {
            email: email,
        },
        attributes: ['id', 'verification_code', 'email_verified']
    });

    if (!user || user.verification_code !== code) {
        return res.sendStatus(400);
    }

    // update user
    user.email_verified = true;
    user.verification_code = null;
    await user.save();

    res.sendStatus(200);
};