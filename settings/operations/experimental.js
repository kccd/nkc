module.exports = {
	GET: 'visitExperimentalStatus',
  login: {
	  GET: "experimentalLogin",
    POST: "experimentalLogin"
  },
	settings: {
	  ip: {
	    GET: 'experimentalIPSettings',
      POST: 'experimentalIPSettings',
      DELETE: 'experimentalIPSettings'
    },
	  visit: {
	    GET: 'experimentalVisitSettings',
      PUT: 'experimentalVisitSettings'
    },
		verification: {
			GET: "experimentalVerificationSettings",
			PUT: 'experimentalVerificationSettings'
		},
		editor: {
			GET: "experimentalEditorSettings",
			PUT: "experimentalEditorSettings"
		},
		sticker: {
			GET: "experimentalStickerSettings",
			PUT: "experimentalStickerSettings"
		},
		thread: {
			GET: "experimentalThreadSettings",
			PUT: "experimentalThreadSettings"
		},
    transfer: {
      GET: "experimentalTransferKCB",
      POST: "experimentalTransferKCB",
      PUT: "experimentalTransferKCB"
    },
	  hidePost: {
      GET: "experimentalHidePostSettings",
      POST: "experimentalHidePostSettings"
    },
	  topping: {
      GET: "experimentalToppingSettings",
      PUT: "experimentalToppingSettings"
    },
	  username: {
	    GET: "experimentalUsernameSettings",
      PUT: "experimentalUsernameSettings"
    },
	  login: {
	    GET: "experimentalLoginSettings",
      PUT: "experimentalLoginSettings"
    },
	  cache: {
	    GET: "experimentalCacheSettings",
      PUT: "experimentalCacheSettings"
    },
		shop: {
			GET: 'visitShopSettings',
			PUT: 'visitShopSettings',
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
          PUT: "modifyShopRefundSettings"
        }
			},
			products: {
				GET: "visitiShopProducts",
				bansale:{
					PUT: "shopAdminBanProductSale"
				},
				clearban: {
					PUT: "shopAdminClearBanSale"
				}
			},
			auth: {
				GET: "visitShopAuth",
				POST: "setShopAuth",
				delban: {
					PUT: "delShelfAuth"
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
					PUT: 'deleteHomeSettingCarousel'
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
				PUT: "updateProtocolType",
				POST: "deleteProtocolType"
			}
		},
		sms: {
			GET: 'visitSmsSettings',
			PUT: 'modifySmsSettings',
      test: {
        POST: 'testSendMessage'
      }
		},
		email: {
			GET: 'visitExperimentalEmailSettings',
			PUT: 'modifyEmailSettings',
      test: {
			  POST: 'testSendEmail'
      }
		},
		base: {
			GET: 'visitWebBaseSettings',
			PUT: 'modifyWebBase',
		},
		home: {
			top: {
				GET: 'visitHomeTopSettings',
				PUT: 'modifyHomeTopSettings'
			},
			notice: {
				GET: 'visitHomeNoticeSettings',
				PUT: 'modifyHomeNoticeSettings',
				DELETE: 'deleteHomeNotice'
      },
      list: {
        GET: 'visitHomeListSettings',
				PUT: 'modifyHomeListSettings',
				biglogo: {
					POST: 'uploadHomeBigLogo'
				}
      }
		},
		app:{
			GET: "experimentalAppSettings",
			POST: "experimentalAppSettings",
			PUT: "experimentalAppSettings"
		},
		role: {
			GET: 'visitRoleSettings',
			POST: 'addRole',
			PARAMETER: {
				GET: 'visitRoleUsers',
        DELETE: 'deleteRole',
        PUT: 'modifyRole',
				icon: {
          POST: 'uploadRoleIcon'
        }
			}
		},
		operation: {
			GET: 'visitOperationSetting',
			POST: 'addOperationType',
			PUT: 'modifyOperation',
			PARAMETER: {
				GET: 'visitOperationType',
				PUT: 'modifyOperationType',
				DELETE: 'deleteOperationType'
			}
		},
		user: {
			GET: 'visitEUserSettings',
			PUT: 'modifyEUserInfo',
			PARAMETER: {
				GET: 'visitEUserInfo',
				PUT: 'modifyEUserInfo'
			}
		},
		userScores: {
			GET: 'getUserAllScores'
		},
		sensitive: {
			GET: 'visitUserSensitiveInfo',
			PUT: 'modifyUserSensitiveInfo'
		},
		forum: {
			GET: 'experimentalForumsSettings',
			POST: 'experimentalForumsSettings',
			PUT: 'experimentalForumsSettings'
		},
		grade: {
			GET: 'visitUsersGradeSettings',
			PUT: 'modifyUsersGradeSettings',
		},
		score: {
			GET: 'experimentalScoreSettings',
			PUT: 'experimentalScoreSettings'
		},
		kcb: {
			GET: 'visitKcbSettings',
			PUT: 'modifyKcbSettings',
      record: {
        PUT: "modifyWithdrawRecord"
      }
		},
    xsf: {
		  GET: 'visitXsfSettings',
      PUT: 'modifyXsfSettings'
    },
		log: {
			GET: 'logParamsSetting',
			POST: 'logParamsSettingModify'
		},
		page: {
			GET: 'visitPageSettings',
			PUT: 'modifyPageSettings'
		},
		exam: {
			GET: 'visitExamSettings',
			PUT: 'modifyExamSettings'
		},
		message: {
			GET: 'visitEMessageSettings',
			PUT: 'modifyEMessageSettings'
		},
		share: {
			GET: 'visitEShareSettings',
			PUT: 'modifyEShareSettings'
		},
		post: {
			GET: 'visitEPostSettings',
			PUT: 'modifyEPostSettings'
		},
    sub: {
      GET: "experimentalSubSettings",
      PUT: "experimentalSubSettings"
    },
    register: {
      GET: "experimentalRegisterSettings",
      PUT: "experimentalRegisterSettings"
    },
    safe: {
      GET: "experimentalSafeSettings",
			PUT: "experimentalSafeSettings",
			unverifiedPhone: {
				GET: "unverifiedPhonePage"
      },
			modifyPassword: {
				POST: "modifyBackendPassword"
			},
			weakPasswordCheck: {
        GET: "weakPasswordCheck",
        result: {
          GET: "weakPasswordCheckResult"
        }
      }
    },
    auth: {
      GET: "experimentalUserAuth",
      PUT: "experimentalUserAuth"
    },
    review: {
      GET: "experimentalReviewSettings",
			PUT: "experimentalReviewSettings",
			keyword: {
				PUT: "experimentalKeywordSettings"
			}
    },
    column: {
		  GET: "experimentalColumnSettings",
      PUT: "experimentalColumnSettings"
    },
    library: {
      GET: "experimentalLibrarySettings",
      PUT: "experimentalLibrarySettings"
    },
    download: {
      GET: "experimentalDownloadSettings",
      PUT: "experimentalDownloadSettings"
    },
    upload: {
      GET: "experimentalUploadSettings",
      PUT: "experimentalUploadSettings"
    },
    'red-envelope': {
		  GET: 'visitERedEnvelope',
      PUT: 'modifyEPostSettings'
    },
		recharge: {
			GET: 'experimentalRechargeSettings',
			PUT: 'experimentalRechargeSettings',
		},
		sensitiveWords: {
			GET: "sensitiveWords"
		}
	},
	systemInfo: {
		GET: 'visitSystemInfo',
		POST: 'sendSystemInfo',
    PUT: "modifySystemInfo",
		DELETE: "deleteSystemInfo",
		fuzzy_search_user: {
			GET: "fuzzySearchUser"
		}
	},
	log: {
    GET: 'visitPublicLogs',
		resource: {
    	GET: 'experimentalResourceLogs'
		},
		blacklist: {
    	GET: 'visitExperimentalBlacklist'
		},
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
		},
		smscode: {
			GET: "viewSmscodeRecord"
		},
		emailcode: {
			GET: "viewEmailcodeRecord"
		},
		userCode: {
		  GET: 'experimentalUserCodeLog'
    }
	},
  console: {
		GET: 'visitExperimentalConsole'
	},
	tools: {
		GET: "visitToolsManager"
	},
	auth: {
		GET: 'visitAuthList',
		PARAMETER: {
			GET: 'visitUserAuth',
			DELETE: 'cancelSubmitVerify',
			verify2: {
				POST: "modifyUserVerifyStatus"
			},
			verify3: {
				POST: "modifyUserVerifyStatus"
			},
			a: {
				PARAMETER: {
					GET: "auditorVisitVerifiedUpload"
				}
			}
		}
	}
};