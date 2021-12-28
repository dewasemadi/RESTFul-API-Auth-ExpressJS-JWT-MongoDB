const { google } = require('googleapis');
const axios = require('axios');
const {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  SERVER_BASE_URL,
  CLIENT_BASE_URL,
} = process.env;
const { getStandardResponse } = require('../helpers/getStandardResponse');
const { User } = require('../models/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  `${SERVER_BASE_URL}/auth/google/callback`
);

// Generating an authentication URL
const url = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
});

// fetch the user profile with access bearer token
const getGoogleUser = async (access_token, id_token) => {
  try {
    const response = await axios.get(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        params: {
          access_token: access_token,
        },
      },
      {
        header: {
          Authorization: `Bearer ${id_token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.message);
  }
};

const generateAuthorizationUrl = (req, res) => {
  try {
    res.status(200).json(getStandardResponse(true, 'Successfully generate google authentication URL', { url: url }));
  } catch (error) {
    res.status(401).json(getStandardResponse(false, error.message));
  }
};

// Retrieve authorization code from google services to our server (express)
// GET /auth/google/callback?code={authorizationCode}
const getAccessToken = async (req, res) => {
  const code = req.query.code; // <code> for getting tokens coming from googleapis services

  try {
    // tokens will provide an object with the access_token and refresh_token.
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    const { sub, name, email, email_verified } = await getGoogleUser(tokens.access_token, tokens.id_token);

    // cek user in database
    const user = await User.findOne({ email: email });
    const newId = mongoose.Types.ObjectId(`000${sub}`);

    const userObject = {
      _id: user ? user._id : newId,
      name: user ? user.name : name,
      email: user ? user.email : email,
      isEmailVerified: user ? user.isEmailVerified : email_verified,
    };

    // save user if not already in database
    if (!user) await new User(userObject).save();

    const accessToken = jwt.sign({ _id: user ? user._id : newId }, ACCESS_TOKEN_SECRET, { expiresIn: '30m' }); // 30 minutes
    const refreshToken = jwt.sign({ _id: user ? user._id : newId }, REFRESH_TOKEN_SECRET, { expiresIn: '30d' }); // 30 days

    // add token to the response json
    userObject.accessToken = accessToken;
    userObject.refreshToken = refreshToken;

    // store jwt token into client cookies
    res.cookie('access_token', accessToken, { maxAge: 1800000, httpOnly: true }); // 30 minutes * 60 seconds * 1000 miliseconds
    res.cookie('refresh_token', refreshToken);
    res.redirect(`${CLIENT_BASE_URL}/private`);
  } catch (error) {
    console.log('Failed to fetch google account detail');
    throw new Error(error.message);
  }
};

const getGoogleUserFromDB = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user });
    if (!user) return res.status(404).json(getStandardResponse(false, 'Email not found'));
    res.status(200).json(getStandardResponse(false, 'Get google user successfully', user));
  } catch (error) {
    res.status(404).json(getStandardResponse(false, error.message));
  }
};

module.exports = { generateAuthorizationUrl, getAccessToken, getGoogleUserFromDB };
