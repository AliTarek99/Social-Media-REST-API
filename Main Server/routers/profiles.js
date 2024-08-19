const controller = require('../controllers/profiles');
const router = require('express').Router();
const { check } = require('express-validator');

router.get('/:id', controller.getProfile);

router.post('/update', [
        check('name').isLength({max: 20, min: 3}).withMessage('invalid name length'),
        check('bio').isLength({max: 100, min: 0}).withMessage('invalid bio length')
    ], 
    controller.updateProfile
);

router.post('/update/avatar', controller.updateAvatar);

router.get('/:id/followers', controller.getFollowers);

router.get('/:id/following', controller.getFollowing);

router.post('/follow/:id', controller.follow);

router.post('/unfollow/:id', controller.unfollow);

router.get('/posts', controller.getPosts);

router.get('/saved-posts', controller.getSavedPosts);

router.get('/notifications', controller.getNotifications);

router.post('/notifications/:id', controller.markAsRead);

router.get('/search/:name', controller.searchProfiles);

module.exports = router;