const nodemailer = require('nodemailer');
const { NODE_ENV, AUTH_EMAIL, AUTH_EMAIL_PASSWORD, EMAIL_SENDER } = process.env;
const { emailMask } = require('../helpers/emailMask');
const { verifyEmailTemplate, resetPasswordTemplate } = require('../templates/emailTemplate');

const sendEmail = (email, token, flag) => {
  const isDevMode = NODE_ENV === 'development';

  const transport = nodemailer.createTransport({
    host: isDevMode ? 'smtp.mailtrap.io' : 'smtp.gmail.com',
    port: isDevMode ? 2525 : 465,
    auth: {
      user: isDevMode ? 'f33610dd8c81fd' : AUTH_EMAIL,
      pass: isDevMode ? 'b1dd850548cc92' : AUTH_EMAIL_PASSWORD,
    },
  });

  let options = {
    from: EMAIL_SENDER,
    to: email,
  };

  if (flag === 'EMAIL_VERIFICATION') {
    options.subject = 'Verify Your Email';
    options.html = verifyEmailTemplate(token);
  } else if (flag === 'RESET_PASSWORD') {
    options.subject = 'Reset Password Link';
    options.html = resetPasswordTemplate(token);
  }

  transport.sendMail(options, (error, response) => {
    error ? console.log(error) : console.log(`Email sucessfully sent to ${emailMask(response.accepted[0])}`);
  });
};

module.exports = { sendEmail };
