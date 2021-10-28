module.exports = {
	GET: 'getThreadByQuery',
	PARAMETER: {
		GET: 'visitThread',
		POST: 'postToThread',
		moveDraft: {
      reason: {
        PUT: "modifyReasonThreadReturn"
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
		block: {
			POST: 'pushThread',
			GET:	'pushThread'
		},
		hometop: {
			GET: "homeTop",
			POST: 'homeTop',
			DELETE: 'homeTop'
		},
		ad: {
			GET: "homeAd",
			POST: 'homeAd',
			DELETE: 'homeAd'
		},
		/*switchInPersonalForum: {
			PUT: 'switchInPersonalForum'
		},*/
		close: {
			POST: 'closeThread',
			DELETE: 'openThread'
    },
    subscribe: {
		  POST: "subThread",
      DELETE: 'unSubThread'
		}
	}
};
