const { Operations } = require('../operations.js');
module.exports = {
  GET: Operations.searchUser,
  PARAMETER: {
    profile: {
      GET: Operations.visitUserCard,
      manage: {
        GET: Operations.getUserHomeCard,
      },
      manageData: {
        GET: Operations.getUserHomeCard,
      },
      column: {
        GET: Operations.getUserHomeCard,
      },
      columnData: {
        GET: Operations.getUserHomeCard,
      },
      timeline: {
        GET: Operations.getUserHomeCard,
      },
      timelineData: {
        GET: Operations.getUserHomeCard,
      },
      moment: {
        GET: Operations.getUserHomeCard,
      },
      momentData: {
        GET: Operations.getUserHomeCard,
      },
      post: {
        GET: Operations.getUserHomeCard,
      },
      postData: {
        GET: Operations.getUserHomeCard,
      },
      thread: {
        GET: Operations.getUserHomeCard,
      },
      threadData: {
        GET: Operations.getUserHomeCard,
      },
      note: {
        GET: Operations.userProfile,
      },
      noteData: {
        GET: Operations.userProfile,
      },
      draft: {
        GET: Operations.userProfile,
      },
      draftData: {
        GET: Operations.userProfile,
      },
      follower: {
        GET: Operations.getUserHomeCard,
      },
      followerData: {
        GET: Operations.getUserHomeCard,
      },
      fan: {
        GET: Operations.getUserHomeCard,
      },
      fanData: {
        GET: Operations.getUserHomeCard,
      },
      finance: {
        GET: Operations.getUserHomeCard,
      },
      financeData: {
        GET: Operations.getUserHomeCard,
      },
      subscribe: {
        GET: Operations.visitUserCard,
        collection: {
          GET: Operations.getUserHomeCard,
        },
        collectionData: {
          GET: Operations.getUserHomeCard,
        },
        column: {
          GET: Operations.getUserHomeCard,
        },
        columnData: {
          GET: Operations.getUserHomeCard,
        },
        user: {
          GET: Operations.getUserHomeCard,
        },
        userData: {
          GET: Operations.getUserHomeCard,
        },
        forum: {
          GET: Operations.getUserHomeCard,
        },
        forumData: {
          GET: Operations.getUserHomeCard,
        },
        blacklist: {
          GET: Operations.getUserHomeCard,
        },
        blacklistData: {
          GET: Operations.getUserHomeCard,
        },
        thread: {
          GET: Operations.getUserHomeCard,
        },
        threadData: {
          GET: Operations.getUserHomeCard,
        },
      },
    },
    userPanel: {
      GET: Operations.visitUserCard,
    },
    GET: Operations.visitUserCard,
    userHomeCard: {
      GET: Operations.getUserHomeCard,
    },

    verifiedAssets: {
      PARAMETER: {
        GET: Operations.visitVerifiedUpload,
      },
    },
    myProblems: {
      GET: Operations.visitSelfProblems,
      PARAMETER: {
        GET: Operations.visitSelfProblemDetails,
      },
    },
    clear: {
      POST: Operations.clearUserInfo,
    },
    hide: {
      POST: Operations.hideUserHome, // 隐藏用户的主页
    },
    banned: {
      PUT: Operations.unBannedUser,
      DELETE: Operations.bannedUser,
    },
    transaction: {
      GET: Operations.visitUserTransaction,
    },
    settings: {
      GET: Operations.visitUserInfoSettings,
      username: {
        PUT: Operations.modifyUsername,
      },
      info: {
        GET: Operations.visitUserInfoSettings,
        PUT: Operations.modifyUserInfo,
      },
      security: {
        GET: Operations.visitUserInfoSettings,
        PUT: Operations.modifyUserInfo,
      },
      loginRecord: {
        GET: Operations.visitUserInfoSettings,
        PUT: Operations.modifyUserInfo,
      },
      apps: {
        GET: Operations.visitUserInfoSettings,
        PUT: Operations.modifyUserInfo,
      },
      resume: {
        GET: Operations.visitUserResumeSettings,
        PUT: Operations.modifyUserResume,
      },
      transaction: {
        GET: Operations.visitUserTransactionSettings,
        PUT: Operations.modifyUserTransaction,
      },
      social: {
        GET: Operations.visitUserSocialSettings,
        PUT: Operations.modifyUserSocial,
      },
      photo: {
        GET: Operations.visitUserPhotoSettings,
        PUT: Operations.modifyUserPhotoSettings,
      },
      water: {
        GET: Operations.visitUserWaterSettings,
        PUT: Operations.modifyUserWaterSettings,
      },
      cert: {
        GET: Operations.visitUserCertPhotoSettings,
        PUT: Operations.modifyUserCertPhotoSettings,
      },
      password: {
        GET: Operations.visitPasswordSettings,
        PUT: Operations.modifyPassword,
      },
      mobile: {
        GET: Operations.visitMobileSettings,
        PUT: Operations.modifyMobile,
        DELETE: Operations.unbindMobile,
        POST: Operations.bindMobile,
        apply: {
          GET: Operations.applyToChangeUnusedPhoneNumber,
          POST: Operations.applyToChangeUnusedPhoneNumber,
        },
        verify: {
          POST: Operations.applyToChangeUnusedPhoneNumber,
        },
      },
      email: {
        GET: Operations.visitEmailSettings,
        POST: Operations.sendEmail,
        bind: {
          GET: Operations.bindEmail,
        },
        verify: {
          GET: Operations.changeEmail,
        },
        unbind: {
          GET: Operations.unbindEmail,
        },
      },
      verify: {
        GET: Operations.visitVerifySettings,
        verify3_form: {
          POST: Operations.verify3VideoUpload,
        },
        verify2_form: {
          POST: Operations.verify2ImageUpload,
        },
      },
      red_envelope: {
        GET: Operations.visitUserRedEnvelopeSettings,
        PUT: Operations.modifyUserRedEnvelopeSettings,
      },
      display: {
        GET: Operations.userDisplaySettings,
        PUT: Operations.userDisplaySettings,
      },
      alipay: {
        POST: Operations.userBindAlipayAccounts,
      },
      bank: {
        POST: Operations.userBindBankAccounts,
      },
    },
    drafts: {
      GET: Operations.visitDraftList,
      POST: Operations.addDraft,
      PARAMETER: {
        DELETE: Operations.deleteDraft,
      },
    },
    subscribe: {
      POST: Operations.subscribeUser,
      DELETE: Operations.unSubscribeUser,
    },
    transfer: {
      GET: Operations.transferKcbToUser,
      POST: Operations.transferKcbToUser,
    },
    destroy: {
      GET: Operations.destroyAccount,
      POST: Operations.destroyAccount,
    },
    violationRecord: {
      GET: Operations.violationRecord,
    },
    forum: {
      apply: {
        GET: Operations.applyForum,
        POST: Operations.applyForum,
      },
      invitation: {
        GET: Operations.applyForumInvitation,
        POST: Operations.applyForumInvitation,
      },
    },
    phoneVerify: {
      // GET: "phoneVerifyPage",
      POST: Operations.phoneVerify,
      sendSmsCode: {
        POST: Operations.sendPhoneVerifyCode,
      },
    },
    alt: {
      GET: Operations.getUserOtherAccount,
    },
    code: {
      POST: Operations.viewUserCode,
    },
  },
};
