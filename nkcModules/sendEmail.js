/*
const settings = require('../settings');
let mailSecrets = settings.mailSecrets;
const nm = require('nodemailer');
let transporter = nm.createTransport(mailSecrets.smtpConfig);
let sendMail = async (mailOptions) => {
  return await transporter.sendMail(mailOptions);
};
module.exports = sendMail;*/

const {smtpConfig, exampleMailOptions} = require('../settings/emailSecrets');
const nm = require('nodemailer');
const transporter = nm.createTransport(smtpConfig);

const sendEmail = (mailOptions) => {
	mailOptions.from = exampleMailOptions.from;
	return new Promise((resolve, reject) => {
		transporter.sendMail(mailOptions, (error, info) => {
			if(error) {
				reject(error);
			} else {
				resolve(info);
			}
		})
	})
};

module.exports = sendEmail;