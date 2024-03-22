const { Operations } = require('../operations.js');
module.exports = {
  PARAMETER: {
    GET: Operations.visitPost,
    PUT: Operations.modifyPost,
    option: {
      GET: Operations.getPostOption,
    },
    quote: {
      GET: Operations.quotePost,
    },
    credit: {
      xsf: {
        POST: Operations.creditXsf,
        PARAMETER: {
          DELETE: Operations.cancelXsf,
        },
      },
      kcb: {
        POST: Operations.creditKcb,
        PARAMETER: {
          PUT: Operations.modifyKcbRecordReason,
        },
      },
    },
    history: {
      GET: Operations.visitPostHistory,
      PUT: Operations.disableHistories,
      PARAMETER: {
        rollback: {
          POST: Operations.rollbackPost,
        },
      },
    },
    digest: {
      POST: Operations.digestPost,
      DELETE: Operations.unDigestPost,
    },
    vote: {
      up: {
        POST: 'post-vote-up',
      },
      down: {
        POST: 'post-vote-down',
      },
    },
    warning: {
      POST: Operations.postWarningPost,
      PUT: Operations.postWarningPatch,
    },
    author: {
      GET: Operations.getPostAuthor,
    },
    anonymous: {
      POST: Operations.anonymousPost,
    },
    notice: {
      PARAMETER: {
        content: {
          PUT: Operations.modifyPostNoticeContent,
        },
        disabled: {
          PUT: Operations.disablePostNotice,
        },
      },
    },
    notices: {
      GET: Operations.getPostNotices,
    },
    topped: {
      POST: Operations.topPost,
    },
    resources: {
      GET: Operations.getPostResources,
    },
    hide: {
      PUT: Operations.hidePost,
    },
    comments: {
      GET: Operations.getPostComments,
    },
    comment: {
      GET: Operations.postCommentControl,
      POST: Operations.postCommentControl,
    },
    /*delete: {
			GET: "deletePost"
		}*/
    collection: {
      POST: Operations.collectionPost,
    },
  },
};
