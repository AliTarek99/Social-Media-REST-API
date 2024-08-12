const controller = require('../controllers/authentication');
const router = require('express').Router();
const { check } = require('express-validator');


router.post('/register', [
        check('email', 'invalid email format').isEmail(), 
        check('password').isLength({max: 30, min: 8}).withMessage('invalid password length'),
        check('name').isLength({max: 20, min: 3}).withMessage('invalid name length')
    ], 
    controller.register
);

router.post('/login', [
        check('email', 'invalid email format').isEmail(),
        check('password').isLength({max: 30, min: 8}).withMessage('invalid password length')
    ], 
    controller.login
);

router.put('/reset-password',
    check('password').isLength({max: 30, min: 8}).withMessage('invalid password length'), 
    controller.resetPassword
);

router.post('/verify-reset-password-token',
    check('token').isLength({ max: 50, min: 50 }).withMessage('invalid token length'), 
    controller.verifyResetPasswordToken
);

router.put('/account-activation', 
    check('code').isLength({max: 6, min: 6}).withMessage('invalid code'),
    controller.verifyEmail
);


module.exports = router;