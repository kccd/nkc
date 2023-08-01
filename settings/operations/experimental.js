const { Operations } = require('../operations.js');
module.exports = {
  GET: Operations.visitExperimentalStatus,
  login: {
    GET: Operations.experimentalLogin,
    POST: Operations.experimentalLogin,
  },
  settings: {
    note: {
      GET: Operations.experimentalNoteSettings,
      PUT: Operations.experimentalNoteSettings,
    },
    threadCategory: {
      GET: Operations.experimentalThreadCategorySettings,
      POST: Operations.experimentalThreadCategorySettings,
      PUT: Operations.experimentalThreadCategorySettings,
      PARAMETER: {
        PUT: Operations.experimentalThreadCategorySettings,
        DELETE: Operations.experimentalThreadCategorySettings,
        default: {
          PUT: Operations.experimentalThreadCategorySettings,
        },
      },
    },
    tools: {
      GET: Operations.visitToolsManager,
    },
    complaint: {
      GET: Operations.experimentalComplaintSettings,
      PUT: Operations.experimentalComplaintSettings,
      type: {
        POST: Operations.experimentalComplaintSettings,
        PUT: Operations.experimentalComplaintSettings,
      },
    },
    ip: {
      GET: Operations.experimentalIPSettings,
      POST: Operations.experimentalIPSettings,
      DELETE: Operations.experimentalIPSettings,
    },
    visit: {
      GET: Operations.experimentalVisitSettings,
      PUT: Operations.experimentalVisitSettings,
    },
    verification: {
      GET: Operations.experimentalVerificationSettings,
      PUT: Operations.experimentalVerificationSettings,
    },
    editor: {
      GET: Operations.experimentalEditorSettings,
      PUT: Operations.experimentalEditorSettings,
    },
    sticker: {
      GET: Operations.experimentalStickerSettings,
      PUT: Operations.experimentalStickerSettings,
    },
    thread: {
      GET: Operations.experimentalThreadSettings,
      PUT: Operations.experimentalThreadSettings,
    },
    transfer: {
      GET: Operations.experimentalTransferKCB,
      POST: Operations.experimentalTransferKCB,
      PUT: Operations.experimentalTransferKCB,
    },
    hidePost: {
      GET: Operations.experimentalHidePostSettings,
      POST: Operations.experimentalHidePostSettings,
    },
    topping: {
      GET: Operations.experimentalToppingSettings,
      PUT: Operations.experimentalToppingSettings,
    },
    username: {
      GET: Operations.experimentalUsernameSettings,
      PUT: Operations.experimentalUsernameSettings,
    },
    login: {
      GET: Operations.experimentalLoginSettings,
      PUT: Operations.experimentalLoginSettings,
    },
    cache: {
      GET: Operations.experimentalCacheSettings,
      PUT: Operations.experimentalCacheSettings,
    },
    shop: {
      GET: Operations.visitShopSettings,
      PUT: Operations.visitShopSettings,
      refunds: {
        GET: Operations.visitShopRefundList,
        refundDetail: {
          GET: Operations.visitShopRefundDetail,
        },
        agree: {
          POST: Operations.shopAgreeRefundApply,
        },
        disagree: {
          POST: Operations.shopDisagreeRefundApply,
        },
        settings: {
          GET: Operations.visitShopRefundSettings,
          PUT: Operations.modifyShopRefundSettings,
        },
      },
      products: {
        GET: Operations.visitiShopProducts,
        bansale: {
          PUT: Operations.shopAdminBanProductSale,
        },
        clearban: {
          PUT: Operations.shopAdminClearBanSale,
        },
      },
      auth: {
        GET: Operations.visitShopAuth,
        POST: Operations.setShopAuth,
        delban: {
          PUT: Operations.delShelfAuth,
        },
      },
      applys: {
        GET: Operations.visitShopOpenStoreApplys,
        approve: {
          POST: Operations.approveApplyStore,
        },
        reject: {
          POST: Operations.rejectApplyStore,
        },
      },
      homeSetting: {
        carousel: {
          GET: Operations.visitHomeSettingCarousel,
          POST: Operations.changeHomeSettingCarousel,
          PUT: Operations.deleteHomeSettingCarousel,
        },
        featured: {
          GET: Operations.visitHomeSettingFeatured,
          POST: Operations.changeHomeSettingFeatured,
        },
        recommendation: {
          GET: Operations.visitHomeSettingRecommendation,
          POST: Operations.changeHomeSettingRecommendation,
        },
        popular: {
          GET: Operations.visitHomeSettingPopular,
          POST: Operations.changeHomeSettingPopular,
        },
      },
    },
    protocol: {
      GET: Operations.visitProtocolSetting,
      POST: Operations.postNewProtocol,
      PARAMETER: {
        GET: Operations.visitProtocolType,
        PUT: Operations.updateProtocolType,
        POST: Operations.deleteProtocolType,
      },
    },
    sms: {
      GET: Operations.visitSmsSettings,
      PUT: Operations.modifySmsSettings,
      test: {
        POST: Operations.testSendMessage,
      },
    },
    email: {
      GET: Operations.visitExperimentalEmailSettings,
      PUT: Operations.modifyEmailSettings,
      test: {
        POST: Operations.testSendEmail,
      },
    },
    base: {
      GET: Operations.visitWebBaseSettings,
      PUT: Operations.modifyWebBase,
    },
    home: {
      top: {
        GET: Operations.visitHomeTopSettings,
        PUT: Operations.modifyHomeTopSettings,
      },
      notice: {
        GET: Operations.visitHomeNoticeSettings,
        PUT: Operations.modifyHomeNoticeSettings,
        DELETE: Operations.deleteHomeNotice,
      },
      list: {
        GET: Operations.visitHomeListSettings,
        PUT: Operations.modifyHomeListSettings,
        biglogo: {
          POST: Operations.uploadHomeBigLogo,
        },
      },
    },
    app: {
      GET: Operations.experimentalAppSettings,
      POST: Operations.experimentalAppSettings,
      PUT: Operations.experimentalAppSettings,
    },
    role: {
      GET: Operations.visitRoleSettings,
      POST: Operations.addRole,
      PARAMETER: {
        GET: Operations.visitRoleUsers,
        DELETE: Operations.deleteRole,
        PUT: Operations.modifyRole,
        icon: {
          POST: Operations.uploadRoleIcon,
        },
      },
    },
    operation: {
      GET: Operations.visitOperationSetting,
      POST: Operations.addOperationType,
      PUT: Operations.modifyOperation,
      PARAMETER: {
        GET: Operations.visitOperationType,
        PUT: Operations.modifyOperationType,
        DELETE: Operations.deleteOperationType,
      },
    },
    user: {
      GET: Operations.visitEUserSettings,
      PUT: Operations.modifyEUserInfo,
      PARAMETER: {
        GET: Operations.visitEUserInfo,
        PUT: Operations.modifyEUserInfo,
      },
    },
    userScores: {
      GET: Operations.getUserAllScores,
    },
    sensitive: {
      GET: Operations.visitUserSensitiveInfo,
      PUT: Operations.modifyUserSensitiveInfo,
    },
    forum: {
      GET: Operations.experimentalForumsSettings,
      POST: Operations.experimentalForumsSettings,
      PUT: Operations.experimentalForumsSettings,
    },
    grade: {
      GET: Operations.visitUsersGradeSettings,
      PUT: Operations.modifyUsersGradeSettings,
    },
    score: {
      GET: Operations.experimentalScoreSettings,
      PUT: Operations.experimentalScoreSettings,
    },
    kcb: {
      GET: Operations.visitKcbSettings,
      PUT: Operations.modifyKcbSettings,
      record: {
        PUT: Operations.modifyWithdrawRecord,
      },
    },
    xsf: {
      GET: Operations.visitXsfSettings,
      PUT: Operations.modifyXsfSettings,
    },
    log: {
      GET: Operations.logParamsSetting,
      POST: Operations.logParamsSettingModify,
    },
    page: {
      GET: Operations.visitPageSettings,
      PUT: Operations.modifyPageSettings,
    },
    exam: {
      GET: Operations.visitExamSettings,
      PUT: Operations.modifyExamSettings,
    },
    message: {
      GET: Operations.visitEMessageSettings,
      PUT: Operations.modifyEMessageSettings,
    },
    share: {
      GET: Operations.experimentalShareSettings,
      PUT: Operations.experimentalShareSettings,
    },
    post: {
      GET: Operations.visitEPostSettings,
      PUT: Operations.modifyEPostSettings,
    },
    documentPost: {
      GET: Operations.experimentalDocumentPostSettings,
      PUT: Operations.experimentalDocumentPostSettings,
    },
    sub: {
      GET: Operations.experimentalSubSettings,
      PUT: Operations.experimentalSubSettings,
    },
    register: {
      GET: Operations.experimentalRegisterSettings,
      PUT: Operations.experimentalRegisterSettings,
    },
    safe: {
      GET: Operations.experimentalSafeSettings,
      PUT: Operations.experimentalSafeSettings,
      unverifiedPhone: {
        GET: Operations.unverifiedPhonePage,
      },
      modifyPassword: {
        POST: Operations.modifyBackendPassword,
      },
      weakPasswordCheck: {
        GET: Operations.weakPasswordCheck,
        result: {
          GET: Operations.weakPasswordCheckResult,
          POST: Operations.weakPasswordCheckResult,
        },
      },
    },
    auth: {
      GET: Operations.experimentalUserAuth,
      PUT: Operations.experimentalUserAuth,
    },
    review: {
      GET: Operations.experimentalReviewSettings,
      PUT: Operations.experimentalReviewSettings,
      keyword: {
        PUT: Operations.experimentalKeywordSettings,
      },
    },
    column: {
      GET: Operations.experimentalColumnSettings,
      PUT: Operations.experimentalColumnSettings,
    },
    library: {
      GET: Operations.experimentalLibrarySettings,
      PUT: Operations.experimentalLibrarySettings,
    },
    download: {
      GET: Operations.experimentalDownloadSettings,
      PUT: Operations.experimentalDownloadSettings,
    },
    upload: {
      GET: Operations.experimentalUploadSettings,
      PUT: Operations.experimentalUploadSettings,
    },
    'red-envelope': {
      GET: Operations.visitERedEnvelope,
      PUT: Operations.modifyEPostSettings,
    },
    recharge: {
      GET: Operations.experimentalRechargeSettings,
      PUT: Operations.experimentalRechargeSettings,
    },
    sensitiveWords: {
      GET: Operations.sensitiveWords,
      PUT: Operations.sensitiveWords,
      checker: {
        POST: Operations.sensitiveWords,
      },
    },
    fund: {
      GET: Operations.experimentalFundSettings,
      PUT: Operations.experimentalFundSettings,
    },
    oauth: {
      creation: {
        GET: Operations.manageOauthApp,
        POST: Operations.manageOauthApp,
      },
      manage: {
        GET: Operations.manageOauthApp,
        PARAMETER: {
          DELETE: Operations.manageOauthApp,
          settings: {
            GET: Operations.manageOauthApp,
            PUT: Operations.manageOauthApp,
          },
          secret: {
            POST: Operations.manageOauthApp,
          },
          ban: {
            PUT: Operations.manageOauthApp,
          },
        },
      },
    },
  },
  systemInfo: {
    GET: Operations.visitSystemInfo,
    POST: Operations.sendSystemInfo,
    PUT: Operations.modifySystemInfo,
    DELETE: Operations.deleteSystemInfo,
    fuzzy_search_user: {
      GET: Operations.fuzzySearchUser,
    },
  },
  log: {
    GET: Operations.visitPublicLogs,
    filter: {
      GET: Operations.experimentalFilterLogs,
      POST: Operations.experimentalFilterLogs,
    },
    sensitive: {
      GET: Operations.experimentalFilterLogs,
      POST: Operations.experimentalFilterLogs,
      PARAMETER: {
        GET: Operations.experimentalFilterLogs,
        POST: Operations.experimentalFilterLogs,
      },
    },
    resource: {
      GET: Operations.experimentalResourceLogs,
      PUT: Operations.updateResourceInfo,
      updateInfo: {
        PUT: Operations.updateResourceInfo,
      },
    },
    blacklist: {
      GET: Operations.visitExperimentalBlacklist,
    },
    shop: {
      GET: Operations.visitExperimentalShop,
    },
    recycle: {
      GET: Operations.visitRecycleMarkThreads,
    },
    public: {
      GET: Operations.visitPublicLogs,
      DELETE: Operations.deletePublicLogs,
    },
    secret: {
      GET: Operations.visitSecretLogs,
      POST: Operations.visitSecretLogs,
    },
    message: {
      GET: Operations.visitMessageLogs,
    },
    share: {
      GET: Operations.visitShareLogs,
    } /*
		info: {
			GET: Operations.visitInfoLogs
		},*/,
    experimental: {
      GET: Operations.visitExperimentalLogs,
    },
    behavior: {
      GET: Operations.visitBehaviorLogs,
    },
    score: {
      GET: Operations.visitScoreLogs,
    },
    kcb: {
      GET: Operations.visitExperimentalKcb,
      diff: {
        GET: Operations.visitExperimentalDiffKcb,
        POST: Operations.resetExperimentalDiffKcb,
      },
    },
    xsf: {
      GET: Operations.visitExperimentalXsf,
    },
    recharge: {
      GET: Operations.visitExperimentalRecharge,
    },
    withdraw: {
      GET: Operations.visitExperimentalWithdraw,
    },
    exam: {
      GET: Operations.visitExperimentalExam,
      paper: {
        PARAMETER: {
          GET: Operations.visitExperimentalExam,
        },
      },
    },
    warning: {
      GET: Operations.experimentalWarningLog,
    },
    review: {
      GET: Operations.experimentalReviewLog,
    },
    smscode: {
      GET: Operations.viewSmscodeRecord,
    },
    emailcode: {
      GET: Operations.viewEmailcodeRecord,
    },
    userCode: {
      GET: Operations.experimentalUserCodeLog,
    },
    payment: {
      GET: Operations.experimentalPayment,
    },
  },
  console: {
    GET: Operations.visitExperimentalConsole,
  },
  auth: {
    GET: Operations.visitAuthList,
    PARAMETER: {
      GET: Operations.visitUserAuth,
      DELETE: Operations.cancelSubmitVerify,
      verify2: {
        POST: Operations.modifyUserVerifyStatus,
      },
      verify3: {
        POST: Operations.modifyUserVerifyStatus,
      },
      a: {
        PARAMETER: {
          GET: Operations.auditorVisitVerifiedUpload,
        },
      },
    },
  },
  tools: {
    filter: {
      GET: Operations.experimentalToolsFilter,
      POST: Operations.experimentalToolsFilter,
    },
  },
};
