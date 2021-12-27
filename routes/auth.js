const router = require('express').Router();
const verifyAccessToken = require('../middlewares/verifyAccessToken');
const authController = require('../controllers/authController');
const googleAuthController = require('../services/loginAndSignUpWithGoogle');

router.post('/register', authController.register); // auto send email verification
router.post('/login', authController.login);
router.get('/logout', verifyAccessToken, authController.logout);

// change password when user already logged in
router.put('/change-password', verifyAccessToken, authController.changePassword);

// reset password flow: send reset password link -> create new password
router.post('/reset-password-link', authController.requestResetPasswordLink); // request token to reset password
router.post('/reset-password', authController.resetPassword);

// if user forgot to verify their email or token has expired, user can request email verification
router.post('/email-verification', authController.requestEmailVerification); // request token to verify email
router.get('/email-verification', authController.emailVerification);

// google services
router.get('/google/url', googleAuthController.generateAuthorizationUrl);
router.get('/google/callback', googleAuthController.getAccessToken);
router.get('/google', verifyAccessToken, googleAuthController.getGoogleUserFromDB);

// <access token> will be invalid in 30 minutes
// <refresh token> invalid longer than <access token>
// so that, client can request <access token> again using <refresh token>
router.post('/generate-access-token', authController.generateAccessTokenFromRefreshToken);
router.get('/all-user', verifyAccessToken, authController.getAllUser);

module.exports = router;
