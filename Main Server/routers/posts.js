const controller = require('../controllers/posts');
const router = require('express').Router();

router.post('/upload', controller.uploadPost);

module.exports = router;