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
			GET: 'visitGeneralForumSettings',
			PATCH: 'modifyGeneralForumSettings'
		},
		score: {
			GET: 'visitScoreSettings',
			PATCH: 'modifyScoreSettings'
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