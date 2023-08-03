const { Operations } = require('../operations.js');
module.exports = {
  PARAMETER: {
    DELETE: Operations.deleteArticle,
    options: {
      GET: Operations.getArticleOptions,
    },
    unblock: {
      POST: Operations.unblockArticle,
    },
    draft: {
      DELETE: Operations.deleteArticleDraft,
    },
    collection: {
      POST: Operations.collectionArticle,
    },
    digest: {
      POST: Operations.digestArticle,
      DELETE: Operations.unDigestArticle,
    },
    homeTop: {
      POST: Operations.homeTop,
      DELETE: Operations.homeTop,
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
    vote: {
      up: {
        POST: 'post-vote-up',
      },
      down: {
        POST: 'post-vote-down',
      },
    },
  },
};
