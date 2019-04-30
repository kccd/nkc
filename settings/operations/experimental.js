module.exports = {
	GET: 'visitExperimentalStatus',
	status: {
		GET: 'visitExperimentalStatus'
	},
	settings: {
		shop: {
			GET: 'visitShopSettings',
			refunds: {
				GET: 'visitShopRefundList',
				refundDetail: {
					GET: 'visitShopRefundDetail'
				},
				agree: {
					POST: 'shopAgreeRefundApply'
				},
				disagree: {
					POST: 'shopDisagreeRefundApply'
        },
        settings: {
          GET: "visitShopRefundSettings",
          PATCH: "modifyShopRefundSettings"
        }
			},
			auth: {
				GET: "visitShopAuth",
				POST: "setShopAuth",
				delban: {
					PATCH: "delShelfAuth"
				}
			},
			applys: {
				GET: 'visitShopOpenStoreApplys',
				approve: {
					POST: 'approveApplyStore'
				},
				reject: {
					POST: "rejectApplyStore"
				}
			},
			homeSetting: {
				carousel: {
					GET: 'visitHomeSettingCarousel',
					POST: 'changeHomeSettingCarousel',
					PATCH: 'deleteHomeSettingCarousel'
				},
				featured: {
					GET: 'visitHomeSettingFeatured',
					POST: 'changeHomeSettingFeatured'
				},
				recommendation: {
					GET: 'visitHomeSettingRecommendation',
					POST: 'changeHomeSettingRecommendation'
				},
				popular: {
					GET: 'visitHomeSettingPopular',
					POST: 'changeHomeSettingPopular'
				}
			}
		},
	  login: {
	    GET:'visitLoginSettings',
      PATCH: 'modifyLoginSettings'
    },
		sms: {
			GET: 'visitSmsSettings',
			PATCH: 'modifySmsSettings',
      test: {
        POST: 'testSendMessage'
      }
		},
		email: {
			GET: 'visitExperimentalEmailSettings',
			PATCH: 'modifyEmailSettings',
      test: {
			  POST: 'testSendEmail'
      }
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
      },
      list: {
        GET: 'visitHomeListSettings',
        PATCH: 'modifyHomeListSettings'
      }
		},
		app:{
			upload:{
				GET: 'visitAppUploadIndex',
				POST: 'saveAppUploadInfo'
			},
			histories: {
				GET: 'visitAppUploadHistories'
			}
		},
		role: {
			GET: 'visitRoleSettings',
			POST: 'addRole',
			PARAMETER: {
				GET: 'visitRoleUsers',
        DELETE: 'deleteRole',
        PATCH: 'modifyRole',
				icon: {
          POST: 'uploadRoleIcon'
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
			PATCH: 'modifyKcbSettings',
      record: {
        PATCH: "modifyWithdrawRecord"
      }
		},
    xsf: {
		  GET: 'visitXsfSettings',
      PATCH: 'modifyXsfSettings'
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
		},
		share: {
			GET: 'visitEShareSettings',
			PATCH: 'modifyEShareSettings'
		},
		post: {
			GET: 'visitEPostSettings',
			PATCH: 'modifyEPostSettings'
		},
    sub: {
      GET: "experimentalSubSettings",
      PATCH: "experimentalSubSettings"
    },
    register: {
      GET: "experimentalRegisterSettings",
      PATCH: "experimentalRegisterSettings"
    },
    'red-envelope': {
		  GET: 'visitERedEnvelope',
      PATCH: 'modifyEPostSettings'
    },
	},
	systemInfo: {
		GET: 'visitSystemInfo',
		POST: 'sendSystemInfo'
	},
	log: {
		GET: 'visitPublicLogs',
    recycle: {
		  GET: 'visitRecycleMarkThreads'
    },
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
		},
    kcb: {
		  GET: 'visitExperimentalKcb',
      diff: {
		    GET: "visitExperimentalDiffKcb",
        POST: "resetExperimentalDiffKcb"
      }
    },
    xsf: {
		  GET: 'visitExperimentalXsf'
    },
    recharge: {
		  GET: "visitExperimentalRecharge"
    },
    withdraw: {
		  GET: "visitExperimentalWithdraw"
    },
    exam: {
		  GET: "visitExperimentalExam"
    }
	},
  console: {
	  GET: 'visitExperimentalConsole'
  }
};