module.exports = {
	smtpConfig: {
		host: 'smtp.exmail.qq.com',
		port: 465,
		secure: true, // use SSL
		auth: {
			user: 'it@kc.ac.cn',
			pass: '8815!Qm'
		}
	},
	exampleMailOptions: {
		from: '"中国科创联互联网中心" <it@kc.ac.cn>',
		to: 'redacted@noop.com',
		subject: 'noop',
		text: 'redacted',
	}
};

