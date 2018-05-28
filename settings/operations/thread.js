module.exports = {
	GET: 'getThreadByQuery',
	PARAMETER: {
		GET: 'visitThread',
		POST: 'postToThread',
		moveThread: {
			PATCH: 'moveThread'
		},
		addColl: {
			POST: 'collectThread'
		},
		digest: {
			PATCH: 'digestThread'
		},
		topped: {
			PATCH: 'toppedThread'
		},
		switchInPersonalForum: {
			PATCH: 'switchInPersonalForum'
		}
	}
};