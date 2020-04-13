module.exports = {
	PARAMETER: {
		GET: 'visitPost',
		PATCH: 'modifyPost',
		quote: {
			GET: 'quotePost'
		},
		credit: {
			xsf: {
				POST: 'creditXsf',
        PARAMETER: {
          DELETE: 'cancelXsf'
        }
			},
			kcb: {
				POST: 'creditKcb',
        PARAMETER: {
          PATCH: "modifyKcbRecordReason"
        }
			}
		},
		history: {
			GET: 'visitPostHistory',
			PATCH: 'disableHistories',
			PARAMETER: {
				rollback: {
					POST: "rollbackPost"
				}
			}
		},
		digest: {
			POST: 'digestPost',
			DELETE: 'unDigestPost'
		},
    vote: {
		  up: {
		    POST: 'post-vote-up'
      },
      down: {
		    POST: 'post-vote-down'
      }
    },
    warning: {
		  POST: "postWarningPost",
      PATCH: "postWarningPatch"
    },
    author: {
		  GET: "getPostAuthor"
    },
    anonymous: {
		  POST: "anonymousPost"
    },
    topped: {
		  POST: "topPost"
    },
		resources: {
			GET: "getPostResources"
		},
		hide: {
			PATCH: "hidePost"
		}
	}
};