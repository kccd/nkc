module.exports = {
	smtpConfig: {
		host: String,
		port: Number,
		secure: Boolean,
		auth: {
			user: String,
			pass: String
		}
	},
	exampleMailOptions: {
		from: String,
		to: String,
		subject: String,
		text: String,
	}
};