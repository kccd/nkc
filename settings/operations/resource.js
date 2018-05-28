module.exports = {
	avatar: {// 用户头像
		PARAMETER: {
			GET: 'getUserAvatar',
			POST: 'uploadUserAvatar'
		}
	},
	avatar_small: {// 用户头像
		PARAMETER: {
			GET: 'getUserAvatar',
		}
	},
	forum_avatar: {// 专业logo
		PARAMETER: {
			POST: 'updateForumImage',
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
			GET: 'getPhoto'
		}
	},
	photo_small: {
		PARAMETER: {
			GET: 'getSmallPhoto'
		}
	}
};