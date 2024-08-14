const controller = require('../controllers/messaging');
const router = require('express').Router();
const { check } = require('express-validator');

router.get('/conversations', controller.getConversations);

router.get('/conversations/:conversationId', controller.getConversation);

router.post('/conversations/:conversationId', controller.sendMessage);

router.get('/conversations/non-received', controller.getNonReceivedMessages);

module.exports = router;