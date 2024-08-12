const controller = require('../controllers/posts');
const router = require('express').Router();

router.post('/upload', controller.uploadPost);

router.get('/media/:objectname', controller.getMedia);

router.get('/:id', controller.getPost);

router.get('/', controller.getTimeline);

router.get('/:id/comments', controller.getComments);

router.post('/:id/comment', controller.comment);

router.post('/:id/like', controller.like);

router.post('/:id/save', controller.save);

router.post('/:id/unlike', controller.unlike);

router.post('/:id/unsave', controller.unsave);

router.get('/:id/likes', controller.getLikes);

router.post('/:id/share', controller.share);

router.delete('/:id', controller.deletePost);

router.post('/:id/report', controller.reportPost);


module.exports = router;