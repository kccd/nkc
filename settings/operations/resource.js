module.exports = {
	logo: {
		POST: 'uploadHomeLogo',
		PARAMETER: {
			GET: 'getHomeLogo'
		}
	},
	avatar: {// 用户头像
		PARAMETER: {
			GET: 'getUserAvatar',
			POST: 'uploadUserAvatar'
		}
	},
	poster: {// 活动海报
		PARAMETER: {
			GET: 'getActivityPoster'
		},
		POST: 'uploadActivityPoster',
	},
	avatar_small: {// 用户头像
		PARAMETER: {
			GET: 'getUserAvatar',
		}
	},
	forum_avatar: {// 专业logo
		PARAMETER: {
			POST: 'updateForumAvatar',
			GET: 'getForumAvatar'
		}
	},
	r: {// 资源
		POST: 'uploadResources',
		PARAMETER: {
			GET: 'getResources'
		}
	},
	rt: {
		PARAMETER: {
			GET: 'getResources'
		}
	},
	cover: {// 文章封面图
		PARAMETER: {
			GET: 'getThreadCover'
		}
	},
	frameImg: {// 视频封面图
		PARAMETER: {
			GET: 'getVideoImg'
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
	fundLogo: {// 基金项目logo
		POST: 'updateFundLogo',
		PARAMETER: {
			GET: 'getFundLogo'
		}
	},
	fundBanner: {// 基金项目banner
		POST: 'updateFundBanner',
		PARAMETER: {
			GET: 'getFundBanner'
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