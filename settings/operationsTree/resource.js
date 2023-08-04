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
  shopLogo: {
    PARAMETER: {
      GET: Operations.getShopLogo,
      POST: Operations.uploadShopLogo,
    },
  },
  poster: {
    // 活动海报
    PARAMETER: {
      GET: Operations.getActivityPoster,
    },
    POST: Operations.uploadActivityPoster,
  },
  /*avatar_small: {// 用户头像
		PARAMETER: {
			GET: Operations.getUserAvatar,
		}
	},*/
  r: {
    // 资源
    POST: Operations.uploadResources,
    PARAMETER: {
      GET: Operations.getResources,
      PUT: Operations.modifyResources,
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
  rm: {
    PARAMETER: {
      GET: Operations.getMediums,
    },
  },
  ro: {
    PARAMETER: {
      GET: Operations.getOrigins,
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
  attachIcon: {
    // 默认附件图标
    PARAMETER: {
      GET: Operations.getAttachmentIcon,
    },
  },
  pfa: {
    // 专栏logo
    PARAMETER: {
      GET: Operations.getPersonalForumAvatar,
    },
  },
  pfb: {
    // 专栏banner
    PARAMETER: {
      GET: Operations.getPersonalForumBanner,
    },
  },
  photo: {
    // 照片
    POST: Operations.uploadPhoto,
    PARAMETER: {
      GET: Operations.getPhoto,
      DELETE: Operations.deletePhoto,
    },
  },
  photo_small: {
    PARAMETER: {
      GET: Operations.getSmallPhoto,
    },
  },
};
