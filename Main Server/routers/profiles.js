const controller = require('../controllers/profiles');
const router = require('express').Router();

router.get('/:id', controller.getProfile);

router.post('/update', controller.updateProfile);

router.post('/update/avatar', controller.updateAvatar);

router.get('/:id/followers', controller.getFollowers);

router.get('/:id/following', controller.getFollowing);

router.post('/follow/:id', controller.follow);

router.post('/unfollow/:id', controller.unfollow);

router.get('/:id/posts', controller.getPosts);

router.get('/saved-posts', controller.getSavedPosts);

router.get('/notifications', controller.getNotifications);

router.post('/notifications/:id', controller.markAsRead);

router.get('/search/:name', controller.searchProfiles);

module.exports = router;