const controller = require('../controllers/support');
const { decodejwt } = require('../util/helper');
const router = require('express').Router();
const { check } = require('express-validator');

router.use((req, res, next) => {
    // decode jwt for all paths except register path
    if(['/register', '/login'].includes(req.path)) {
        return next();
    }

    const payload = decodejwt(req, res);
    if(payload.role != 'support') {
        return res.sendStatus(401);
    }
    next();
});

router.post('/login', [
        check('email').isEmail(),
        check('password').isLength({ min: 5 })
    ], 
    controller.login
);

router.post('/register', [
        check('email').isEmail(),
        check('password').isLength({ min: 5 }),
        check('name').isLength({ min: 3 })
    ],
    controller.register);

router.put('/ban/:id', controller.banUser);

router.put('/suspend/:id', controller.suspendUser);

router.delete('/delete-post/:id', controller.deletePost);

router.delete('/posts/:postId/delete-comment/:commentId', controller.deleteComment);

router.delete('/delete-account/:id', controller.deleteAccount);

router.put('/approve-user/:id', controller.approveUser);

router.get('/search/:name', controller.searchSupportAccounts);

router.get('/user/:id', controller.getSupportAccount)

router.put('/update-role/:id', controller.updateRole);

router.put('/warning/:id', controller.warnUser);

router.get('/reports/assigned', controller.assignedReports);

router.get('/reports/unassigned', controller.unassignedReports);

router.post('/reports/:id', controller.assignReport);

router.get('/reports/:id', controller.getReport);

router.get('/unapproved-users', controller.getUnapprovedUsers);

module.exports = router;