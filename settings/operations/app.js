module.exports = {
	me: {
		GET: 'APPgetLoginUserInfo',
		personal: {
			GET: 'APPgetLoginUserPersonal'
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
	},
	thread: {
		GET: 'APPgetThreadInfo',
		PARAMETER: {
			GET: 'APPvisitThread'
		}
	}
};