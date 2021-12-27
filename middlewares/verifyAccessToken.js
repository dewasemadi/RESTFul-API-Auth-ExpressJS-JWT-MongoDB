const jwt = require('jsonwebtoken');
const { getStandardResponse } = require('../helpers/getStandardResponse.js');
const { ACCESS_TOKEN_SECRET } = process.env;

const verifyAccessToken = (req, res, next) => {
  // get HttpOnly cookie flag
  const token = req.cookies['access_token'];
  if (!token) return res.status(401).json(getStandardResponse(false, 'Unauthorized', null));

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.clearCookie('access_token');
    res.status(401).json(getStandardResponse(false, 'Invalid token', null));
  }
};

module.exports = verifyAccessToken;
