const controller = require('../controllers/support');
const { decodejwt } = require('../util/helper');
const router = require('express').Router();

router.use((req, res, next) => {
    // decode jwt for all paths except register path
    if(req.path == '/register') {
        return next();
    }

    decodejwt(req, res, next);
});

router.post('/register', controller.register);

router.put('/ban/:id', controller.banUser);

router.put('/suspend/:id', controller.suspendUser);

router.delete('/delete-post/:id', controller.deletePost);

router.delete('/delete-comment/:id', controller.deleteComment);

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

module.exports = router;