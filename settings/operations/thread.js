const { Operations } = require('../operations.js');
module.exports = {
  GET: Operations.getThreadByQuery,
  PARAMETER: {
    GET: Operations.visitThread,
    POST: Operations.postToThread,
    'post-order': {
      PUT: Operations.editThreadPostOrder,
    },
    moveDraft: {
      reason: {
        PUT: Operations.modifyReasonThreadReturn,
      },
    },
    collection: {
      POST: Operations.collectThread,
    },
    /* digest: {
			POST: Operations.digestThread,
			DELETE: Operations.unDigestThread
		}, */
    topped: {
      POST: Operations.toppedThread,
      DELETE: Operations.unToppedThread,
    },
    block: {
      POST: Operations.pushThread,
      GET: Operations.pushThread,
    },
    hometop: {
      GET: Operations.homeTop,
      POST: Operations.homeTop,
      DELETE: Operations.homeTop,
    },
    ad: {
      GET: Operations.homeAd,
      POST: Operations.homeAd,
      DELETE: Operations.homeAd,
    },
    /*switchInPersonalForum: {
			PUT: Operations.switchInPersonalForum
		},*/
    close: {
      POST: Operations.closeThread,
      DELETE: Operations.openThread,
    },
    subscribe: {
      POST: Operations.subThread,
      DELETE: Operations.unSubThread,
    },
  },
};
