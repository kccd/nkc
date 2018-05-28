module.exports = {
	GET: 'visitForumsCategory',
	POST: 'addForum',
	PARAMETER: {
		GET: 'visitForumHome',
		POST: 'postToForum',
		DELETE: 'deleteForum',
		latest: {
			GET: 'visitForumLatest'
		},
		home: {
			GET: 'visitForumHome'
		},
		visitors: {
			GET: 'viewForumVisitors'
		},
		followers: {
			GET: 'viewForumFollowers'
		},
		settings: {
			GET: 'visitForumInfoSettings',
			info: {
				GET: 'visitForumInfoSettings',
				PATCH: 'modifyForumInfo'
			},
			image: {
				GET: 'visitForumImageSettings',
			},
			category: {
				GET: 'visitForumCategorySettings',
				PATCH: 'modifyForumCategory',
				POST: 'addForumCategory'
			},
			permission: {
				GET: 'visitForumPermissionSettings',
				PATCH: 'modifyForumPermission'
			}
		},
		subscribe: {
			DELETE: 'unSubscribeForum',
			POST: 'subscribeForum'
		}
	}
};