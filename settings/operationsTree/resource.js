const { Operations } = require('../operations.js');
module.exports = {
  avatar: {
    // 用户头像
    PARAMETER: {
      GET: Operations.getUserAvatar,
      POST: Operations.uploadUserAvatar,
    },
  },
  banner: {
    PARAMETER: {
      POST: Operations.modifyUserBanner,
      homeBanner: {
        POST: Operations.modifyUserBanner,
      },
    },
  },
  r: {
    // 资源
    POST: Operations.uploadResources,
    PARAMETER: {
      GET: Operations.getResources,
      PUT: Operations.disableResource,
      info: {
        GET: Operations.getResourceInfo,
      },
      del: {
        POST: Operations.modifyResources,
      },
      pay: {
        POST: Operations.buyResource,
      },
      detail: {
        GET: Operations.resourceDetail,
      },
      cover: {
        GET: Operations.getResourceCover,
      },
    },
  },
  appDownload: {
    // 安装包下载
    android: {
      PARAMETER: {
        GET: Operations.getAndroidPackage,
      },
    },
    ios: {
      PARAMETER: {
        GET: Operations.getIosPackage,
      },
    },
  },
  default: {
    // 默认图片
    PARAMETER: {
      GET: Operations.getDefaultImage,
    },
  },
  pfb: {
    // 专栏banner
    PARAMETER: {
      GET: Operations.getPersonalForumBanner,
    },
  },
};
