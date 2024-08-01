const controller = require('../controllers/posts');
const router = require('express').Router();

router.post('/upload', controller.uploadPost);

router.get('/media/:objectname', controller.getMedia);

module.exports = router;