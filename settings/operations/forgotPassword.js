module.exports = {
	mobile: {
		GET: 'visitFindPasswordByMobile',
		POST: 'findPasswordVerifyMobile',
		PATCH: 'modifyPasswordByMobile'
	},
	email: {
		GET: 'visitFindPasswordByEmail',
		POST: 'findPasswordSendVerifyEmail',
		PATCH: 'modifyPasswordByEmail',
		verify: {
			GET: 'findPasswordVerifyEmail'
		}
	},
};