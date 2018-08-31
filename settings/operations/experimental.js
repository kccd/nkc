module.exports = {
	GET: 'visitExperimentalStatus',
	status: {
		GET: 'visitExperimentalStatus'
	},
	settings: {
		sms: {
			GET: 'visitSmsSettings',
			PATCH: 'modifySmsSettings',
		},
		email: {
			GET: 'visitExperimentalEmailSettings',
			PATCH: 'modifyEmailSettings'
		},
		base: {
			GET: 'visitWebBaseSettings',
			PATCH: 'modifyWebBase'
		},
		home: {
			logo: {
				GET: 'visitHomeLogoSettings',
				PATCH: 'modifyHomeLogoSettings',
				DELETE: 'deleteHomeLogo'
			},
			top: {
				GET: 'visitHomeTopSettings',
				PATCH: 'modifyHomeTopSettings'
			},
			notice: {
				GET: 'visitHomeNoticeSettings',
				PATCH: 'modifyHomeNoticeSettings',
				DELETE: 'deleteHomeNotice'
			}
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
					GET: 'visitRoleUsers',
					PATCH: 'modifyRoleUsers'
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
		/*score: {
			GET: 'visitScoreSettings',
			PATCH: 'modifyScoreSettings'
		},*/
		/*download: {
			GET: 'visitDownloadSettings',
			PATCH: 'modifyDownloadSettings'
		},*/
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
		number: {
			GET: 'visitNumberSettings',
			PATCH: 'modifyNumberSettings'
		},
		kcb: {
			GET: 'visitKcbSettings',
			PATCH: 'modifyKcbSettings'
		},
		log: {
			GET: 'logParamsSetting',
			POST: 'logParamsSettingModify'
		},
		page: {
			GET: 'visitPageSettings',
			PATCH: 'modifyPageSettings'
		},
		exam: {
			GET: 'visitExamSettings',
			PATCH: 'modifyExamSettings'
		},
		message: {
			GET: 'visitEMessageSettings',
			PATCH: 'modifyEMessageSettings'
		}
	},
	systemInfo: {
		GET: 'visitSystemInfo',
		POST: 'sendSystemInfo'
	},
	log: {
		GET: 'visitPublicLogs',
		public: {
			GET: 'visitPublicLogs',
			DELETE: 'deletePublicLogs'
		},
		secret: {
			GET: 'visitSecretLogs'
		},
		info: {
			GET: 'visitInfoLogs'
		},
		experimental: {
			GET: 'visitExperimentalLogs'
		},
		behavior: {
			GET: 'visitBehaviorLogs'
		},
		score: {
			GET: 'visitScoreLogs'
		}
	}
};