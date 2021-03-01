module.exports = {
	PARAMETER: {
		GET: 'visitPost',
		PUT: 'modifyPost',
		option: {
			GET: 'getPostOption',
		},
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
          PUT: "modifyKcbRecordReason"
        }
			}
		},
		history: {
			GET: 'visitPostHistory',
			PUT: 'disableHistories',
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
      PUT: "postWarningPatch"
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
			PUT: "hidePost"
		},
		comments: {
			GET: 'getPostComments'
		},
		comment: {
			GET: 'postCommentControl',
			POST: 'postCommentControl'
		}
		/*delete: {
			GET: "deletePost"
		}*/
	}
};
