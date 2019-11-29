module.exports = {
	GET: 'getThreadByQuery',
	PARAMETER: {
		GET: 'visitThread',
		POST: 'postToThread',
		disabled: {
			POST: 'moveThread'
		},
		moveDraft: {
			PATCH: 'moveDraft',
      reason: {
        PATCH: "modifyReasonThreadReturn"
      }
		},
    collection: {
      POST: 'collectThread'
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
			GET: "homeTop",
			POST: 'homeTop',
			DELETE: 'unHomeTop'
		},
		/*switchInPersonalForum: {
			PATCH: 'switchInPersonalForum'
		},*/
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