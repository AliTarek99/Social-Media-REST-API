import { expect } from 'chai';
import auth, { login } from '../controllers/authentication.js';
import { default as User_metadata } from '../models/User_metadata.js';
import { default as Users } from '../models/Users.js';
import Sinon from 'sinon';
import helper from '../util/helper.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const sandbox = Sinon.createSandbox();

describe('Login', function () {

    afterEach(function () {
        sandbox.restore();
    });

    it('Should be able to Login', async function () {
        const req = {
            body: {
                email: 'example1@gmail.com',
                password: 'test'
            }
        };

        sandbox.stub(User_metadata, 'findOne');
        User_metadata.findOne.returns({
            password: 'test',
            email_verified: true,
            banned: false,
            id: 1,
            name: 'etc'
        });

        sandbox.stub(bcrypt, 'compare');
        bcrypt.compare.returns(true);

        sandbox.stub(jwt, 'sign');
        jwt.sign.returns('token');

        const res = {
            status: function (statusCode) {
                expect(statusCode).to.equal(200);
                return this;
            },
            json: function (data) {
                expect(data).to.deep.equal({ token: 'token' });
            }
        };

        await auth.login(req, res);
    });

    it('Should not be able to login if the email does not exist', async function () {
        const req = {
            body: {
                email: 'example1@gmail.com',
                password: 'test'
            }
        };

        sandbox.stub(User_metadata, 'findOne');
        User_metadata.findOne.returns(null);

        const res = {
            sendStatus: function (statusCode) {
                expect(statusCode).to.equal(400);
            }
        };

        await auth.login(req, res);
    });

    it('Should not be able to login if the password is incorrect', async function () {
        const req = {
            body: {
                email: 'Email',
                password: 'test'
            }
        };

        sandbox.stub(User_metadata, 'findOne');
        User_metadata.findOne.returns({
            password: 'test',
            email_verified: true,
            banned: false,
            id: 1,
            name: 'etc'
        });

        sandbox.stub(bcrypt, 'compare');
        bcrypt.compare.returns(false);

        const res = {
            sendStatus: function (statusCode) {
                expect(statusCode).to.equal(400);
            }
        };

        await auth.login(req, res);
    });

});

describe('Register', function () {

    afterEach(function () {
        sandbox.restore();
    });

    it('Should be able to register', async function () {
        const req = {
            body: {
                email: 'EMAIL',
                password: 'test',
                name: 'test'
            }
        };

        sandbox.stub(User_metadata, 'findOne');
        User_metadata.findOne.returns(null);

        sandbox.stub(Users, 'create');
        Users.create.returns({
            id: 1
        });

        sandbox.stub(User_metadata, 'create');
        User_metadata.create.returns({
            email: 'EMAIL',
            password: 'test',
            verification_code: 123456
        });

        sandbox.stub(bcrypt, 'hash');
        bcrypt.hash.returns('test');


        const res = {
            sendStatus: function (statusCode) {
                expect(statusCode).to.equal(201);
            }
        }

        await auth.register(req, res);
    });

    it('Should not be able to register if the email already exists', async function () {
        const req = {
            body: {
                email: 'EMAIL',
                password: 'test',
                name: 'test'
            }
        };

        sandbox.stub(User_metadata, 'findOne');
        User_metadata.findOne.returns({
            email: 'EMAIL'
        });

        const res = {
            status: function (statusCode) {
                expect(statusCode).to.equal(400);
                return this;
            },
            json: function (data) {
                expect(data).to.deep.equal({ errors: [{ msg: 'Email already exists', path: 'email' }] });
            }
        }
    });
});

describe('Forgot Password', function () {

    afterEach(function () {
        sandbox.restore();
    });

    it('Should be able to send a reset password token', async function () {
        const req = {
            body: {
                email: 'EMAIL'
            }
        };

        sandbox.stub(User_metadata, 'findOne');
        User_metadata.findOne.returns({
            id: 1,
            email: 'EMAIL'
        });

        sandbox.stub(helper, 'sendEmail');
        helper.sendEmail.returns(true);

        const res = {
            sendStatus: function (statusCode) {
                expect(statusCode).to.equal(200);
            }
        };

        await auth.forgotPassword(req, res);

        expect(helper.sendEmail.calledOnce).to.be.true;
    });

    it('Should not be able to send a reset password token if the email does not exist', async function () {
        const req = {
            body: {
                email: 'EMAIL'
            }
        };

        sandbox.stub(User_metadata, 'findOne');
        User_metadata.findOne.returns(null);

        sandbox.stub(helper, 'sendEmail');
        helper.sendEmail.returns(true);

        const res = {
            sendStatus: function (statusCode) {
                expect(statusCode).to.equal(200);
            }
        }

        await auth.forgotPassword(req, res);

        expect(helper.sendEmail.called).to.be.false;
    });
});

describe('Verify Reset Password Token', function () {

    afterEach(function () {
        sandbox.restore();
    });

    it('Should be able to verify the reset password token', async function () {
        const req = {
            body: {
                token: 123456,
                email: 'EMAIL'
            }
        };

        sandbox.stub(User_metadata, 'findOne');
        User_metadata.findOne.returns({
            id: 1,
            email: 'EMAIL',
            reset_password_token: 123456
        });

        const res = {
            sendStatus: function (statusCode) {
                expect(statusCode).to.equal(200);
            }
        };

        await auth.verifyResetPasswordToken(req, res);
    });

    it('Should not be able to verify the reset password token if the token is wrong', async function () {
        const req = {
            body: {
                token: 123456,
                email: 'EMAIL'
            }
        };

        sandbox.stub(User_metadata, 'findOne');
        User_metadata.findOne.returns({
            id: 1,
            email: 'EMAIL',
            reset_password_token: 1234567
        });

        const res = {
            sendStatus: function (statusCode) {
                expect(statusCode).to.equal(400);
            }
        };

        await auth.verifyResetPasswordToken(req, res);
    });

    it('Should not be able to verify the token if the email does not exist', async function () {
        const req = {
            body: {
                token: 123456,
                email: 'EMAIL'
            }
        };

        sandbox.stub(User_metadata, 'findOne');
        User_metadata.findOne.returns(null)

        const res = {
            sendStatus: function (statusCode) {
                expect(statusCode).to.equal(400);
            }
        };

        await auth.verifyResetPasswordToken(req, res);
    });
});

describe('Reset Password', function () {

    afterEach(function () {
        sandbox.restore();
    });

    it('Should be able to reset the password', async function () {
        const req = {
            body: {
                token: 123456,
                password: 'test',
                email: 'EMAIL'
            }
        };

        sandbox.stub(User_metadata, 'findOne');
        User_metadata.findOne.returns({
            id: 1,
            email: 'EMAIL',
            reset_password_token: 123456,
            password: 'test',
            save: function () {}
        });

        sandbox.stub(bcrypt, 'hash');
        bcrypt.hash.returns('test');

        const res = {
            sendStatus: function (statusCode) {
                expect(statusCode).to.equal(200);
            }
        };

        await auth.resetPassword(req, res);
    });

    it('Should not be able to reset the password if the token is wrong', async function () {
        const req = {
            body: {
                token: 123456,
                password: 'test',
                email: 'EMAIL'
            }
        };

        sandbox.stub(User_metadata, 'findOne');
        User_metadata.findOne.returns({
            id: 1,
            email: 'EMAIL',
            reset_password_token: 1234567,
            password: 'test',
            save: function () {}
        });

        const res = {
            sendStatus: function (statusCode) {
                expect(statusCode).to.equal(400);
            }
        };

        await auth.resetPassword(req, res);
    });
});

describe('Verify Email', function () {

    afterEach(function () {
        sandbox.restore();
    });

    it('Should be able to verify the email', async function () {
        const req = {
            body: {
                code: 123456,
                email: 'EMAIL'
            }
        };

        sandbox.stub(User_metadata, 'findOne');
        User_metadata.findOne.returns({
            id: 1,
            email: 'EMAIL',
            verification_code: 123456,
            email_verified: false,
            save: function () {}
        });

        const res = {
            sendStatus: function (statusCode) {
                expect(statusCode).to.equal(200);
            }
        };

        await auth.verifyEmail(req, res);
    });

    it('Should not be able to verify email if the code is wrong', async function () {
        const req = {
            body: {
                code: 123456,
                email: 'EMAIL'
            }
        };

        sandbox.stub(User_metadata, 'findOne');
        User_metadata.findOne.returns({
            id: 1,
            email: 'EMAIL',
            verification_code: 1234567,
            email_verified: false,
            save: function () {}
        });

        const res = {
            sendStatus: function (statusCode) {
                expect(statusCode).to.equal(400);
            }
        };

        await auth.verifyEmail(req, res);
    });
});