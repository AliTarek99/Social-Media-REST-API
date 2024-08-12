const controller = require('../controllers/messaging');
const router = require('express').Router();

router.get('/conversations', controller.getConversations);

router.get('/conversations/:conversationId', controller.getConversation);

router.post('/conversations/:conversationId', controller.sendMessage);

module.exports = router;