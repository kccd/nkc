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
};
