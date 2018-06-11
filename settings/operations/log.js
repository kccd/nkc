module.exports = {
	GET: 'visitPublicLogs',
	public: {
		GET: 'visitPublicLogs'
	},
	secret: {
		GET: 'visitSecretLogs'
	},
	info: {
		GET: 'visitInfoLogs'
	},
	experimental: {
		GET: 'visitExperimentalLogs'
	},
	behavior: {
		GET: 'visitBehaviorLogs'
	}
};