module.exports = {
	GET: 'visitForumsCategory', // 查看全部专业
	POST: 'addForum', // 添加专业
	PARAMETER: {
		GET: 'visitForumHome', // 查看专业主页
		POST: 'postToForum', // 在专业中发表文章
    DELETE: 'deleteForum', // 删除专业
    card: {
      GET: "visitForumCard"
    },
		latest: {
			GET: 'visitForumLatest' // 查看专业最新文章列表
		},
		home: {
			GET: 'visitForumHome' // 查看专业主页
		},
		visitors: {
			GET: 'viewForumVisitors' // 查看来访者
		},
		followers: {
			GET: 'viewForumFollowers' // 查看关注者
		},
		settings: {
			GET: 'visitForumInfoSettings', // 查看专业基本信息设置
			info: {
				GET: 'visitForumInfoSettings', // 查看专业基本信息设置
				PUT: 'modifyForumInfo' // 修改专业基本信息设置
			},
			merge: {
				GET: 'visitForumMergeSettings', // 查看专业合并
				PUT: 'modifyMergeSettings', // 修改专业合并设置
			},
			kind: {
				PUT: "addForumKind", // 添加专业类别
				clear: {
					PUT: "delForumKind" // 清除专业类别
				}
			},
			category: {
				GET: 'visitForumCategorySettings', // 查看专业分类设置
				PUT: 'modifyForumCategory', // 修改专业分类设置
				POST: 'addForumCategory', // 添加专业下的文章分类
				DELETE: 'removeForumCategory' // 删除专业下的文章分类
			},
			permission: {
				GET: 'visitForumPermissionSettings', // 查看专业权限设置
				PUT: 'modifyForumPermission' // 修改专业权限设置
			},
			score: {
				GET: 'forumScoreSettings',
				PUT: 'forumScoreSettings'
			},
			review: {
				GET: 'visitForumReviewSettings', // 查看审核设置
				PUT: 'modifyForumReviewSettings' // 修改专业审核设置
			}
		},
		subscribe: {
			DELETE: 'unSubscribeForum', // 用户取消关注专业
			POST: 'subscribeForum' // 用户关注专业
		},
    library: {
      GET: "visitForumLibrary",
      POST: "createForumLibrary"
    }
	}
};
