const { CLIENT_BASE_URL } = process.env;

const verifyEmailTemplate = (token) => {
  return `<b><a href="${CLIENT_BASE_URL}/auth/email-verification?token=${token}">Click here</a></b> to verify your account. 
    This link <b>expires in 1 hour</b>. Thank you`;
};

const resetPasswordTemplate = (token) => {
  return `<b><a href="${CLIENT_BASE_URL}/auth/reset-password?token=${token}">Click here</a></b> to reset your password. 
    This link <b>expires in 1 hour</b>. Thank you`;
};

module.exports = { verifyEmailTemplate, resetPasswordTemplate };
