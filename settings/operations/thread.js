module.exports = {
	GET: 'getThreadByQuery',
	PARAMETER: {
		GET: 'visitThread',
		POST: 'postToThread',
		moveThread: {
			PATCH: 'moveThread'
		},
		moveDraft: {
			PATCH: 'moveDraft'
		},
		addColl: {
			POST: 'collectThread'
		},
		digest: {
			POST: 'digestThread',
			DELETE: 'unDigestThread'
		},
		topped: {
			POST: 'toppedThread',
			DELETE: 'unToppedThread'
		},
		hometop: {
			POST: 'homeTop',
			DELETE: 'unHomeTop'
		},
		switchInPersonalForum: {
			PATCH: 'switchInPersonalForum'
		}
	}
};