const nm = require('nodemailer');
const mongoose = require('mongoose');

const sendEmail = async (options) => {
  const {email, type, code} = options;
  const SettingModel = mongoose.model('settings');
  const emailSettings = await SettingModel.findOnly({_id: 'email'});
  const {smtpConfig, from, templates} = emailSettings.c;
  const emailOptions = {
    to: email,
    from
  };
  if(smtpConfig.secure) smtpConfig.port = 465;
  let template = templates.filter(t => t.name === type);
  if(template.length === 0) throw `未知的模板类型`;
  template = template[0];
  const {title, text} = template;
  emailOptions.subject = title;
  emailOptions.html = text + `<h2>${code}</h2>`;
  const transporter = nm.createTransport(smtpConfig);
	return new Promise((resolve, reject) => {
		transporter.sendMail(emailOptions, (error, info) => {
			if(error) {
				reject(error);
			} else {
				resolve(info);
			}
		})
	})
};

module.exports = sendEmail;