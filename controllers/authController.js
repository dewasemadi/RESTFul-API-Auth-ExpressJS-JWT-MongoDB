const { User, registerValidation, loginValidation, changePasswordValidation } = require('../models/User');
const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;
const { Token } = require('../models/Token');
const { getStandardResponse } = require('../helpers/getStandardResponse');
const { hashedPassword } = require('../helpers/hashedPassword');
const { sendEmail } = require('../services/sendEmail');
const { nanoid } = require('nanoid');
const { emailMask } = require('../helpers/emailMask');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  const { name, email, password } = req.body;

  // data validation
  const { error } = registerValidation.validate(req.body);
  if (error) return res.status(422).json(getStandardResponse(false, error.details[0].message));

  // check the email
  const isEmailExist = await User.findOne({ email: email });
  if (isEmailExist) return res.status(409).json(getStandardResponse(false, 'Email already exists'));

  try {
    // create a new user
    const user = await new User({
      name: name,
      email: email,
      password: await hashedPassword(password),
    }).save();

    // create a new token to verify email address
    const token = await new Token({
      user_id: user._id,
      token: nanoid(32),
    }).save();

    // Send email verification
    sendEmail(email, token.token, 'EMAIL_VERIFICATION');
    res.status(201).json(getStandardResponse(true, 'Check your email to verify your account', user));
  } catch (error) {
    res.status(400).json(getStandardResponse(false, error.message));
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  // data validation
  const { error } = loginValidation.validate(req.body);
  if (error) return res.status(401).json(getStandardResponse(false, error.details[0].message));

  // check the email
  const user = await User.findOne({ email: email });
  if (!user) return res.status(404).json(getStandardResponse(false, 'Email not found'));

  // check the email must be verified
  const userEmailVerified = await User.findOne({ email: email, isEmailVerified: true });
  if (!userEmailVerified)
    return res.status(401).json(getStandardResponse(false, 'Check your email to verify your account before login'));

  // checking the password with db pass
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) return res.status(401).json(getStandardResponse(false, 'Invalid password'));

  try {
    const accessToken = jwt.sign({ _id: user.id }, ACCESS_TOKEN_SECRET, { expiresIn: '30m' }); // 30 minutes
    const refreshToken = jwt.sign({ _id: user.id }, REFRESH_TOKEN_SECRET, { expiresIn: '30d' }); // 30 days

    const response = {
      _id: user._id,
      name: user.name,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      accessToken: accessToken,
      refreshToken: refreshToken,
    };

    // store jwt token into client cookies
    res.cookie('access_token', accessToken, { maxAge: 1800000, httpOnly: true }); // 30 minutes * 60 seconds * 1000 miliseconds
    res.cookie('refresh_token', refreshToken);
    res.status(200).json(getStandardResponse(true, 'Login successfully', response));
  } catch (error) {
    res.status(401).json(getStandardResponse(false, error.message));
  }
};

const logout = (req, res) => {
  try {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.status(200).json(getStandardResponse(true, 'Logout successfully'));
  } catch (error) {
    res.status(401).json(getStandardResponse(false, error.message));
  }
};

// user has been logged in, and they want to change password
const changePassword = async (req, res) => {
  const { old_password, new_password, new_password_confirmation } = req.body;

  // data validation
  const { error } = changePasswordValidation.validate({
    new_password: new_password,
    new_password_confirmation: new_password_confirmation,
  });
  if (error) return res.status(422).json(getStandardResponse(false, error.details[0].message));

  const user = await User.findOne({ _id: req.user });
  const isOldPassSameWithDbPass = await bcrypt.compare(old_password, user.password);
  if (!isOldPassSameWithDbPass) return res.status(401).json(getStandardResponse(false, 'Old password is wrong'));

  // check if old password is same with new password
  if (old_password === new_password)
    return res.status(401).json(getStandardResponse(false, 'Your new password must be different with old password'));

  try {
    await user.updateOne({ password: await hashedPassword(new_password) });
    res.status(200).json(getStandardResponse(true, 'Password changed successfully', { _id: user._id }));
  } catch (error) {
    res.status(400).json(getStandardResponse(false, error.message));
  }
};

// user forgot their password, so that they can request reset password link
const requestResetPasswordLink = async (req, res) => {
  const { email } = req.body;

  // check the email
  const user = await User.findOne({ email: email });
  if (!user) return res.status(404).json(getStandardResponse(false, 'Email not found'));

  try {
    // create a new token to verify email address
    const token = await new Token({
      user_id: user._id,
      token: nanoid(32),
      flag: 'RESET_PASSWORD',
    }).save();

    sendEmail(email, token.token, 'RESET_PASSWORD');
    res.status(200).json(getStandardResponse(true, `Reset password link has been sent to ${emailMask(email)}`));
  } catch (error) {
    res.status(404).json(getStandardResponse(false, error.message));
  }
};

// set new password
const resetPassword = async (req, res) => {
  const requestToken = req.query.token;
  const { new_password, new_password_confirmation } = req.body;

  // data validation
  const { error } = changePasswordValidation.validate({
    new_password: new_password,
    new_password_confirmation: new_password_confirmation,
  });
  if (error) return res.status(422).json(getStandardResponse(false, error.details[0].message));

  const isValidToken = await Token.findOne({ token: requestToken });
  if (!isValidToken)
    return res.status(404).json(getStandardResponse(false, 'Your token has probably expired. Please try again'));

  try {
    const user = await User.findOne({ _id: isValidToken.user_id });
    await user.updateOne({ password: await hashedPassword(new_password) });
    res.status(200).json(getStandardResponse(true, 'Password changed successfully', { _id: user._id }));

    // delete token
    await Token.deleteOne({ token: requestToken });
  } catch (error) {
    res.status(400).json(getStandardResponse(false, error.message));
  }
};

// user forgot to verify email or token has been expired, so that they can request email verification
const requestEmailVerification = async (req, res) => {
  const { email } = req.body;

  // check the email
  const isEmailExist = await User.findOne({ email: email });
  if (!isEmailExist) return res.status(404).json(getStandardResponse(false, 'Email not found'));

  // is email already verified
  const isEmailAlreadyVerified = await User.findOne({ isEmailVerified: true });
  if (isEmailAlreadyVerified) return res.status(400).json(getStandardResponse(false, 'Your email has been verified'));

  try {
    // create a new token to verify email address
    const token = await new Token({
      user_id: isEmailExist._id,
      token: nanoid(32),
    }).save();

    sendEmail(email, token.token, 'EMAIL_VERIFICATION');
    res.status(200).json(getStandardResponse(true, `Email verification link has been sent to ${emailMask(email)}`));
  } catch (error) {
    res.status(400).json(getStandardResponse(false, error.message));
  }
};

// verify user email
const emailVerification = async (req, res) => {
  const requestToken = req.query.token;

  const isValidToken = await Token.findOne({ token: requestToken });
  if (!isValidToken)
    return res.status(404).json(getStandardResponse(false, 'Your token has probably expired. Please try again'));

  try {
    const user = await User.findOne({ _id: isValidToken.user_id });
    user.isEmailVerified = true;
    await user.save();
    res.status(201).json(getStandardResponse(true, 'Your email has been successfully verified'));

    // delete token
    await Token.deleteOne({ token: requestToken });
  } catch (error) {
    res.status(400).json(getStandardResponse(false, error.message));
  }
};

const getAllUser = async (req, res) => {
  try {
    const allUser = await User.find({});
    res.status(200).json(getStandardResponse(true, 'Get all users successfully', allUser));
  } catch (error) {
    res.status(404).json(getStandardResponse(true, error.message));
  }
};

const generateAccessTokenFromRefreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(403).json(getStandardResponse(false, 'Access denied, token missing'));

  try {
    // extract payload from refresh token and generate a new access token
    const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    const accessToken = jwt.sign({ _id: payload }, ACCESS_TOKEN_SECRET, { expiresIn: '30m' });

    // store jwt token into client cookies
    res.clearCookie('access_token');
    res.cookie('access_token', accessToken, { httpOnly: true });
    res.status(200).json(getStandardResponse(true, 'Access token successfully updated', { accessToken: accessToken }));
  } catch (error) {
    res.status(403).json(getStandardResponse(false, error.message));
  }
};

module.exports = {
  register,
  login,
  logout,
  changePassword,
  requestResetPasswordLink,
  resetPassword,
  requestEmailVerification,
  emailVerification,
  getAllUser,
  generateAccessTokenFromRefreshToken,
};
