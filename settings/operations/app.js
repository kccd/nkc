module.exports = {
	me: {
		GET: 'APPgetLoginUserInfo',
		personal: {
			GET: 'APPgetLoginUserPersonal'
		},
		subscribe: {
			GET: 'APPgetLoginUserSubscribe'
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
			},
			subscribe: {
				GET: 'APPgetUserSubscribe'
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