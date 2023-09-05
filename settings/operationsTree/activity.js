const { Operations } = require('../operations.js');
module.exports = {
  GET: Operations.visitActivityIndex,
  block: {
    POST: Operations.blockCurrentActivity,
  },
  unblock: {
    POST: Operations.unBlockCurrentActivity,
  },
  release: {
    GET: Operations.activityReleaseIndex,
    POST: Operations.activityReleasePost,
  },
  list: {
    GET: Operations.activityListIndex,
  },
  single: {
    PARAMETER: {
      GET: Operations.visitActivitySingle,
      POST: Operations.activityApplyPost,
      DELETE: Operations.cancelActivityApply,
      PUT: Operations.activityEditPost,
    },
  },
  myApply: {
    GET: Operations.myActivityApplyIndex,
  },
  myRelease: {
    GET: Operations.myActivityReleaseIndex,
  },
  post: {
    PARAMETER: {
      POST: Operations.postToActivity,
    },
  },
  modify: {
    PARAMETER: {
      GET: Operations.getActivityModify,
      POST: Operations.postActivityModify,
      DELETE: Operations.delActivityModify,
      PUT: Operations.sendActivityMessage,
    },
  },
};
