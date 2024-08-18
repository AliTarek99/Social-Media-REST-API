const controller = require('../controllers/messaging');
const router = require('express').Router();
const { check } = require('express-validator');
const { decodejwt } = require('../util/helper');

router.get('/conversations', decodejwt, controller.getConversations);

router.get('/conversations/:conversationId', decodejwt, controller.getConversation);

router.get('/conversations/non-received', decodejwt, controller.getNonReceivedMessages);

module.exports = router;