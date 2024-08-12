const controller = require('../controllers/authentication');
const router = require('express').Router();

router.post('/register', controller.register);

router.post('/login', controller.login);

router.post('/reset-password', controller.resetPassword);

module.exports = router;