module.exports = {
	GET: 'visitExperimentalStatus',
  login: {
	  GET: "experimentalLogin",
    POST: "experimentalLogin"
  },
	settings: {
		editor: {
			GET: "experimentalEditorSettings",
			PATCH: "experimentalEditorSettings"
		},
		sticker: {
			GET: "experimentalStickerSettings",
			PATCH: "experimentalStickerSettings"
		},
		thread: {
			GET: "experimentalThreadSettings",
			PATCH: "experimentalThreadSettings"
		},
    transfer: {
      GET: "experimentalTransferKCB",
      POST: "experimentalTransferKCB",
      PATCH: "experimentalTransferKCB"
    },
	  hidePost: {
      GET: "experimentalHidePostSettings",
      POST: "experimentalHidePostSettings"
    },
	  topping: {
      GET: "experimentalToppingSettings",
      PATCH: "experimentalToppingSettings"
    },
	  username: {
	    GET: "experimentalUsernameSettings",
      PATCH: "experimentalUsernameSettings"
    },
	  login: {
	    GET: "experimentalLoginSettings",
      PATCH: "experimentalLoginSettings"
    },
	  cache: {
	    GET: "experimentalCacheSettings",
      PATCH: "experimentalCacheSettings"
    },
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
			products: {
				GET: "visitiShopProducts",
				bansale:{
					PATCH: "shopAdminBanProductSale"
				},
				clearban: {
					PATCH: "shopAdminClearBanSale"
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
		protocol: {
			GET: 'visitProtocolSetting',
			POST: 'postNewProtocol',
			PARAMETER: {
				GET: "visitProtocolType",
				PATCH: "updateProtocolType",
				POST: "deleteProtocolType"
			}
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
			GET: "experimentalAppSettings",
			POST: "experimentalAppSettings",
			PATCH: "experimentalAppSettings"
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
			// POST: 'addUsersGrade',
			/*PARAMETER: {
				GET: 'visitUsersGradeSettings',
				PATCH: 'modifyUsersGradeSettings',
				DELETE: 'deleteUsersGrade'
			}*/
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
    safe: {
      GET: "experimentalSafeSettings",
      PATCH: "experimentalSafeSettings"
    },
    auth: {
      GET: "experimentalUserAuth",
      PATCH: "experimentalUserAuth"
    },
    review: {
      GET: "experimentalReviewSettings",
      PATCH: "experimentalReviewSettings"
    },
    column: {
		  GET: "experimentalColumnSettings",
      PATCH: "experimentalColumnSettings"
    },
    library: {
      GET: "experimentalLibrarySettings",
      PATCH: "experimentalLibrarySettings"
    },
    download: {
      GET: "experimentalDownloadSettings",
      PATCH: "experimentalDownloadSettings"
    },
    upload: {
      GET: "experimentalUploadSettings",
      PATCH: "experimentalUploadSettings"
    },
    'red-envelope': {
		  GET: 'visitERedEnvelope',
      PATCH: 'modifyEPostSettings'
    },
	},
	systemInfo: {
		GET: 'visitSystemInfo',
		POST: 'sendSystemInfo',
    PATCH: "modifySystemInfo"
	},
	log: {
    GET: 'visitPublicLogs',
    shop: {
      GET: "visitExperimentalShop"
    },
    recycle: {
		  GET: 'visitRecycleMarkThreads'
    },
		public: {
			GET: 'visitPublicLogs',
			DELETE: 'deletePublicLogs'
		},
		secret: {
			GET: 'visitSecretLogs',
			POST: 'visitSecretLogs'
		},
    message: {
		  GET: "visitMessageLogs"
    },
		share: {
			GET: 'visitShareLogs'
		},/*
		info: {
			GET: 'visitInfoLogs'
		},*/
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
    },
    warning: {
		  GET: "experimentalWarningLog"
    },
    review: {
		  GET: "experimentalReviewLog"
    }
	},
  console: {
	  GET: 'visitExperimentalConsole'
  }
};