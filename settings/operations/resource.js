module.exports = {
	avatar: {// 用户头像
		PARAMETER: {
			GET: "getUserAvatar",
			POST: 'uploadUserAvatar'
		}
	},
  banner: {
    PARAMETER: {
      POST: "modifyUserBanner",
    }
  },
	shopLogo: {
		PARAMETER: {
			GET: 'getShopLogo',
			POST: 'uploadShopLogo'
		}
	},
	poster: {// 活动海报
		PARAMETER: {
			GET: 'getActivityPoster'
		},
		POST: 'uploadActivityPoster',
	},
	/*avatar_small: {// 用户头像
		PARAMETER: {
			GET: 'getUserAvatar',
		}
	},*/
	r: {// 资源
    POST: 'uploadResources',
		PARAMETER: {
			GET: 'getResources',
			PUT: "modifyResources",
			info: {
			  GET: "getResourceInfo"
			},
			pay: {
				POST: "buyResource"
			},
			detail: {
				GET: "resourceDetail"
			}
		}
	},
	rm: {
		PARAMETER: {
			GET: 'getMediums'
		}
	},
	ro: {
		PARAMETER: {
			GET: 'getOrigins'
		}
	},
	appDownload: {// 安装包下载
		android: {
			PARAMETER: {
				GET: 'getAndroidPackage'
			}
		},
		ios: {
      PARAMETER: {
				GET: 'getIosPackage'
			}
		}
	},
	resources: {// 侧栏logo
		site_specific: {
			PARAMETER: {
				GET: 'getSiteSpecific'
			}
		}
	},
	default: {// 默认图片
		PARAMETER: {
			GET: 'getDefaultImage'
		}
	},
	attachIcon: {// 默认附件图标
		PARAMETER: {
			GET: 'getAttachmentIcon'
		}
	},
	pfa: {// 专栏logo
		PARAMETER: {
			GET: 'getPersonalForumAvatar'
		}
	},
	pfb: {// 专栏banner
		PARAMETER: {
			GET: 'getPersonalForumBanner'
		}
	},
	photo: {// 照片
		POST: 'uploadPhoto',
		PARAMETER: {
			GET: 'getPhoto',
			DELETE: 'deletePhoto'
		}
	},
	photo_small: {
		PARAMETER: {
			GET: 'getSmallPhoto'
		}
	}
};
