const { Operations } = require('../operations.js');
module.exports = {
  GET: Operations.visitAppDownload,
  upgrade: {
    GET: Operations.APPUpgrade,
  },
  location: {
    GET: Operations.selectLocation,
  },
  check: {
    GET: Operations.APPcheckout,
  },
  nav: {
    GET: Operations.APPGetNav,
  },
  my: {
    GET: Operations.APPGetMy,
  },
  account: {
    GET: Operations.APPGetAccountInfo,
  },
  download: {
    GET: Operations.appGetDownload,
  },
  profile: {
    GET: Operations.appVisitProfile,
    blacklist: {
      GET: Operations.appVisitProfile,
    },
    finance: {
      GET: Operations.appVisitProfile,
    },
    sub: {
      user: {
        GET: Operations.appVisitProfile,
      },
      forum: {
        GET: Operations.appVisitProfile,
      },
      column: {
        GET: Operations.appVisitProfile,
      },
      thread: {
        GET: Operations.appVisitProfile,
      },
      fan: {
        GET: Operations.appVisitProfile,
      },
      follower: {
        GET: Operations.appVisitProfile,
      },
      collection: {
        GET: Operations.appVisitProfile,
      },
    },
  },
  scoreChange: {
    PARAMETER: {
      GET: Operations.APPgetScoreChange,
    },
  },
  android: {
    PARAMETER: {
      GET: Operations.downloadApp,
    },
  },
  ios: {
    PARAMETER: {
      GET: Operations.downloadApp,
    },
  },
  'video-player': {
    GET: Operations.appVideoPlayer,
  },
};
