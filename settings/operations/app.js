module.exports = {
	GET: 'visitAppDownload',
	me: {
		GET: 'APPgetLoginUserInfo',
		personal: {
			GET: 'APPgetLoginUserPersonal'
		},
		subscribe: {
			GET: 'APPgetLoginUserSubscribe'
		}
	},
	/*u: {
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
	},*/
	/*thread: {
		GET: 'APPgetThreadInfo',
		PARAMETER: {
			GET: 'APPvisitThread'
		}
	},*/
	check: {
		GET: 'APPcheckout',
	},
	/*forum: {
		// GET: 'APPgetThreadInfo',
		PARAMETER: {
			GET: 'APPvisitForum'
		}
	},*/
	/*search: {
		GET: 'APPsearch'
	},*/
	scoreChange: {
		PARAMETER: {
			GET: 'APPgetScoreChange'
		}
	},
	/*latest: {
		GET: 'APPgetLatestThreads'
	}*/
};