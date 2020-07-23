module.exports = {
	mobile: {
		GET: 'visitFindPasswordByMobile',
		POST: 'findPasswordVerifyMobile',
		PUT: 'modifyPasswordByMobile'
	},
	email: {
		GET: 'visitFindPasswordByEmail',
		POST: 'findPasswordSendVerifyEmail',
		PUT: 'modifyPasswordByEmail',
		verify: {
			GET: 'findPasswordVerifyEmail'
		}
	},
};
