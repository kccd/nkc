module.exports = {
	GET: 'getThreadByQuery',
	PARAMETER: {
		GET: 'visitThread',
		POST: 'postToThread',
		moveThread: {
			PATCH: 'moveThread'
		},
		moveDraft: {
			PATCH: 'moveDraft',
      reason: {
        PATCH: "modifyReasonThreadReturn"
      }
		},
		addColl: {
			POST: 'collectThread'
		},
		delColl: {
			POST: 'delCollectThread'
		},
		/* digest: {
			POST: 'digestThread',
			DELETE: 'unDigestThread'
		}, */
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
		},
		close: {
			POST: 'closeThread',
			DELETE: 'openThread'
    },
    forum: {
      POST: 'addThreadForum',
      DELETE: 'removeThreadForum',
      // PATCH: 'patchThreadForum'
    },
    subscribe: {
		  POST: "subThread",
      DELETE: 'unSubThread'
    }
	}
};