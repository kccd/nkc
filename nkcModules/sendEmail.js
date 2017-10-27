const settings = require('../settings');
let mailSecrets = settings.mailSecrets;
const nm = require('nodemailer');
let transporter = nm.createTransport(mailSecrets.smtpConfig);
let sendMail = async (mailOptions) => {
  return await transporter.sendMail(mailOptions);
};
module.exports = sendMail;