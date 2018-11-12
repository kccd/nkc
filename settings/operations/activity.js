module.exports = {
  GET: 'visitActivityIndex',
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
      DELETE: "cancelActivityApply"
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
      GET: 'getActivifyModify',
      POST: 'postActivityModify',
      DELETE: 'delActivityModify',
      PATCH: 'sendActivityMessage'
    }
  }
};