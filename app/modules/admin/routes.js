var router = require('express').Router();

var authMiddleware = require('../auth/middlewares/auth');

router.use(authMiddleware.hasAuth);
router.use('/users', require('./users/routes'));

exports.admin = router;