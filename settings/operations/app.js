module.exports = {
	me: {
		GET: 'getLoginUserInfo',
		personal: {
			GET: 'getLoginUserPersonal'
		}
	},
	u: {
		PARAMETER: {
			GET: 'APPgetUserInfo',
			posts: {
				GET: 'APPgetUserPosts'
			},
			threads: {
				GET: 'APPgetUserThreads'
			}
		}
	}
};