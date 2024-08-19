const Users = require('../models/Users');
const Posts = require('../models/Posts');
const Comments = require('../models/Comments');
const Support = require('../models/Support');
const User_metadata = require('../models/User_metadata');
const Reports = require('../models/Reports');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


// Function to handle the post request for logging user in
exports.login = async (req, res, next) => {
    // check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // get the email and password from the request body
    const { email, password } = req.body;

    // get the support from the database
    const support = await Support.findOne({
        where: {
            email: email
        }
    });

    // check if support account exists
    if (!support || await bcrypt.compare(password, support.password)) {
        return res.sendStatus(404);
    }

    // check if support account is verified
    if (!support.verified) {
        return res.sendStatus(401);
    }

    return res.status(200).json({
        token: jwt.sign({
            id: support.id,
            admin: support.admin
        }, process.env.JWT_SECRET, { expiresIn: '1h' })
    });
}

// Function to handle the POST request for registering a user
exports.register = async (req, res, next) => {
    // check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // get the email and password from the request body
    const { email, password, name } = req.body;

    // check if support account already exists
    const supportAccount = await Support.findOne({
        where: {
            email: email
        }
    });

    if (supportAccount) {
        return res.sendStatus(400);
    }

    // hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create the support account
    await Support.create({
        email: email,
        password: hashedPassword,
        name: name
    });

    // send response
    res.sendStatus(200);
}

// Function to handle the PUT request for banning a user
exports.banUser = async (req, res, next) => {
    const { userId } = req.params;

    // get user from database
    const user = await Users.findOne({
        where: {
            id: userId
        },
        attributes: ['banned']
    });

    // check if user exists
    if (!user) {
        return res.sendStatus(404);
    }

    // check if user is already suspended
    if (user.banned) {
        return res.sendStatus(400);
    }

    // update user's suspended status to true
    user.banned = true;
    await user.save();

    // send response
    res.sendStatus(200);
}

// Function to handle the PUT request for suspending a user
exports.suspendUser = async (req, res, next) => {
    const { userId } = req.params;

    // get user from database
    const user = await Users.findOne({
        where: {
            id: userId
        },
        attributes: ['suspended']
    });

    // check if user exists
    if (!user) {
        return res.sendStatus(404);
    }

    // check if user is already suspended
    if (user.suspended) {
        return res.sendStatus(400);
    }

    // update user's suspended status to true
    user.suspended = true;
    await user.save();

    // send response
    res.sendStatus(200);
}

// Function to handle the DELETE request for deleting a post
exports.deletePost = async (req, res, next) => {
    const { postId } = req.params;

    // delete post from the database
    await Posts.destroy({
        where: {
            id: postId
        }
    });

    // send response
    res.sendStatus(200);
}

// Function to handle the DELETE request for deleting a comment
exports.deleteComment = async (req, res, next) => {
    const { commentId, postId } = req.params;

    // delete comment from the database
    await Comments.destroy({
        where: {
            id: commentId,
            postId: postId
        }
    });

    // send response
    res.sendStatus(200);
}

// Function to handle the DELETE request for deleting a support account
exports.deleteAccount = async (req, res, next) => {
    const { id } = req.params;

    // check if the user trying to delete is admin
    const support = await Support.findOne({
        where: {
            id: req.userId
        },
        attributes: ['admin']
    });

    if (!support || !support.admin) {
        return res.sendStatus(401);
    }

    // delete support account from the database
    await Support.destroy({
        where: {
            id: id
        }
    });

    // send response
    res.sendStatus(200);
}

// Function to handle the PUT request for approving a user
exports.approveUser = async (req, res, next) => {
    const { id } = req.params;

    // check if the user trying to delete is admin
    const support = await Support.findOne({
        where: {
            id: req.userId
        },
        attributes: ['admin']
    });

    if (!support || !support.admin) {
        return res.sendStatus(401);
    }

    // update support account to be verified
    await Support.update({
        verified: true
    }, {
        where: {
            id: id
        }
    });

    // send response
    res.sendStatus(200);
}

// Function to handle the GET request for searching support accounts by name
exports.searchSupportAccounts = async (req, res, next) => {
    const { name } = req.params;

    // search for support accounts by name
    const supportAccounts = await Support.findAll({
        where: {
            name: {
                [Op.like]: `${name}%`
            }
        }
    });

    // send response
    res.status(200).json({ accounts: supportAccounts });
}

// Function to handle the GET request for retrieving a support account
exports.getSupportAccount = async (req, res, next) => {
    const { id } = req.params;

    // get support account from database
    const supportAccount = await Support.findOne({
        where: {
            id: id
        }
    });

    // send response
    res.status(200).json(supportAccount);
}

// Function to handle the PUT request for updating a user's role
exports.updateRole = async (req, res, next) => {
    const { id } = req.params;

    // check if the user trying to delete is admin
    const support = await Support.findOne({
        where: {
            id: req.userId
        },
        attributes: ['admin']
    });

    if (!support || !support.admin) {
        return res.sendStatus(401);
    }

    // update support account to be verified
    await Support.update({
        admin: req.body.admin
    }, {
        where: {
            id: id
        }
    });

    // send response
    res.sendStatus(200);
}

// Function to handle the PUT request for warning a user
exports.warnUser = async (req, res, next) => {
    const { id } = req.params;

    // get user from database
    const user = await User_metadata.findOne({
        where: {
            id: id
        },
        attributes: ['num_of_warnings']
    });

    // check if user exists
    if (!user) {
        return res.sendStatus(404);
    }

    // update user's number of warnings
    user.num_of_warnings += 1;
    await user.save();

    if (user.num_of_warnings >= 3) {
        // update user to be banned
        await Users.update({
            banned: true
        }, {
            where: {
                id: id
            }
        });
    }
    else {
        // TODO: notify user
    }

    // send response
    res.sendStatus(200);
}

// Function to handle the GET request for retrieving assigned reports
exports.assignedReports = async (req, res, next) => {
    // get reports assigned to this support from database
    const reports = await Reports.findAll({
        where: {
            supportId: req.userId
        },
        limit: 30,
        order: [['id', 'DESC']],
        offset: req.query.offset || 0
    });

    // send response
    res.status(200).json(reports);
}

// Function to handle the GET request for retrieving unassigned reports
exports.unassignedReports = async (req, res, next) => {
    // get unassigned reports from database
    const reports = await Reports.findAll({
        where: {
            assigned: false
        },
        limit: 30,
        order: [['id', 'DESC']],
        offset: req.query.offset || 0
    });

    // send response
    res.status(200).json(reports);
}

// Function to handle the POST request for assigning a report
exports.assignReport = async (req, res, next) => {
    const { reportId } = req.params;

    // get report from database
    const report = await Reports.findOne({
        where: {
            id: reportId
        },
        attributes: ['assigned', 'supportId']
    });

    // check if report exists
    if (!report) {
        return res.sendStatus(404);
    }

    // check if report is already assigned
    if (report.assigned) {
        return res.sendStatus(400);
    }

    // update report's assigned status to true
    report.assigned = true;
    report.supportId = req.userId;
    await report.save();

    // send response
    res.sendStatus(200);
}

// Function to handle the GET request for retrieving a report
exports.getReport = async (req, res, next) => {
    const { reportId } = req.params;

    // get report from database
    const report = await Reports.findOne({
        where: {
            id: reportId
        }
    });


    // check if report exists
    if (!report) {
        return res.sendStatus(404);
    }

    if (req.userId == report.supportId) {
        // increase reviewed reports of this support
        const support = await Support.findOne({
            where: {
                id: req.userId
            },
            attributes: ['num_of_reviewed_reports']
        });

        support.num_of_reviewed_reports += 1;
        await support.save();
    }

    // send response
    res.status(200).json(report);
}

// Function to handle the GET request for retrieving unapproved users
exports.getUnapprovedUsers = async (req, res, next) => {
    // get unapproved users from database
    const users = await Support.findAll({
        where: {
            verified: false
        },
        limit: 30,
        order: [['id', 'ASC']],
        offset: req.query.offset || 0
    });

    // send response
    res.status(200).json(users);
}