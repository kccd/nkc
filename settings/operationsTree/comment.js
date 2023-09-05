const { Operations } = require('../operations.js');
module.exports = {
  POST: Operations.publishComment,
  GET: Operations.getComments,
  PARAMETER: {
    PUT: Operations.modifyComment,
    DELETE: Operations.deleteComment,
    GET: Operations.getComments,
    quote: {
      GET: Operations.getComments,
    },
    commentEditor: {
      GET: Operations.getComments,
    },
    disabled: {
      POST: Operations.disabledComment,
    },
    unblock: {
      POST: Operations.disabledComment,
    },
    options: {
      GET: Operations.getCommentPermission,
    },
    ipInfo: {
      GET: Operations.getCommentIpInfo,
    },
    digest: {
      POST: Operations.digestComment,
      DELETE: Operations.unDigestComment,
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
