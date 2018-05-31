module.exports = {
	GET: 'visitExperimentalStatus',
	status: {
		GET: 'visitExperimentalStatus'
	},
	settings: {
		base: {
			GET: 'visitWebBaseSettings',
			PATCH: 'modifyWebBase'
		},
		role: {
			GET: 'visitRoleUsers',
			POST: 'addRole',
			PARAMETER: {
				GET: 'visitRoleUsers',
				DELETE: 'deleteRole',
				base: {
					GET: 'visitRoleBaseSettings',
					PATCH: 'modifyRoleBase'
				},
				users: {
					GET: 'visitRoleUsers'
				},
				permissions: {
					GET: 'visitRolePermissionsSettings',
					PATCH: 'modifyRolePermissions'
				}
			}
		},
		operation: {
			GET: 'visitOperationSetting',
			POST: 'addOperationType',
			PATCH: 'modifyOperation',
			PARAMETER: {
				GET: 'visitOperationType',
				PATCH: 'modifyOperationType',
				DELETE: 'deleteOperationType'
			}
		},
		user: {
			GET: 'visitEUserSettings',
			PARAMETER: {
				GET: 'visitEUserInfo',
				PATCH: 'modifyEUserInfo'
			}
		},
		forum: {
			GET: 'visitEForumSettings',
			PATCH: 'modifyEForumSettings'
		},
		score: {
			GET: 'visitScoreSettings',
			PATCH: 'modifyScoreSettings'
		},
		download: {
			GET: 'visitDownloadSettings',
			PATCH: 'modifyDownloadSettings'
		},
		grade: {
			GET: 'visitUsersGradeSettings',
			PATCH: 'modifyUsersGradeSettings',
			POST: 'addUsersGrade',
			PARAMETER: {
				GET: 'visitUsersGradeSettings',
				PATCH: 'modifyUsersGradeSettings',
				DELETE: 'deleteUsersGrade'
			}
		},
		kcb: {
			GET: 'visitKcbSettings',
			PATCH: 'modifyKcbSettings'
		}
	},
	newSysInfo: {
		GET: 'visitSystemInfo',
		POST: 'sendSystemInfo'
	},
	log: {
		GET: 'visitLog'
	}
};