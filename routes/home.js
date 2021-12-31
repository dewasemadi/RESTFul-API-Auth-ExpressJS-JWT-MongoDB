const router = require('express').Router();
const { getStandardResponse } = require('../helpers/getStandardResponse');

router.get('', (req, res) => {
  res.status(200).json(getStandardResponse(true, 'Welcome to ExpressJS Authentication with JWT'));
});

module.exports = router;
