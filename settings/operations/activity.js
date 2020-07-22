module.exports = {
  GET: 'visitActivityIndex',
  block: {
    POST: "blockCurrentActivity"
  },
  unblock: {
    POST: "unBlockCurrentActivity"
  },
  release: {
    GET: 'activityReleaseIndex',
    POST: 'activityReleasePost'
  },
  list: {
    GET: 'activityListIndex'
  },
  single: {
    PARAMETER: {
      GET: "visitActivitySingle",
      POST: "activityApplyPost",
      DELETE: "cancelActivityApply",
      PUT: "activityEditPost"
    }
  },
  myApply: {
    GET: 'myActivityApplyIndex'
  },
  myRelease: {
    GET: 'myActivityReleaseIndex'
  },
  post: {
    PARAMETER: {
      POST: 'postToActivity'
    }
  },
  modify: {
    PARAMETER: {
      GET: 'getActivityModify',
      POST: 'postActivityModify',
      DELETE: 'delActivityModify',
      PUT: 'sendActivityMessage'
    }
  }
};
