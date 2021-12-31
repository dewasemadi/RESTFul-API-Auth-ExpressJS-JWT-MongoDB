const router = require('express').Router();
const homeRouter = require('./home');
const authRouter = require('./auth');

// all endpoints
router.use('/', homeRouter);
router.use('/auth', authRouter);

module.exports = router;
