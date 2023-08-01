module.exports = {
  POST: 'publishComment',
  GET: 'getComments',
  PARAMETER: {
    PUT: 'modifyComment',
    DELETE: 'deleteComment',
    GET: 'getComments',
    quote: {
      GET: 'getComments',
    },
    commentEditor: {
      GET: 'getComments',
    },
    disabled: {
      POST: 'disabledComment',
    },
    unblock: {
      POST: 'disabledComment',
    },
    options: {
      GET: 'getCommentPermission',
    },
    ipInfo: {
      GET: 'getCommentIpInfo',
    },
    digest: {
      POST: 'digestComment',
      DELETE: 'unDigestComment',
    },
    credit: {
      xsf: {
        POST: 'creditXsf',
        PARAMETER: {
          DELETE: 'cancelXsf',
        },
      },
      kcb: {
        POST: 'creditKcb',
        PARAMETER: {
          PUT: 'modifyKcbRecordReason',
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
