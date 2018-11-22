module.exports = {
	GET: 'searchUser',
	PARAMETER: {
		GET: 'visitUserCard',
		banned: {
			PATCH: 'unBannedUser',
			DELETE: 'bannedUser'
		},
		transaction: {
			GET: 'visitUserTransaction'
		},
		settings: {
			GET: 'visitUserAvatarSettings',
			avatar: {
				GET: 'visitUserAvatarSettings',
			},
			username: {
				PATCH: 'modifyUsername'
			},
			info: {
				GET: 'visitUserInfoSettings',
				PATCH: 'modifyUserInfo'
			},
			resume: {
				GET: 'visitUserResumeSettings',
				PATCH: 'modifyUserResume'
			},
			transaction: {
				GET: 'visitUserTransactionSettings',
				PATCH: 'modifyUserTransaction'
			},
			social: {
				GET: 'visitUserSocialSettings',
				PATCH: 'modifyUserSocial'
			},
			photo: {
				GET: 'visitUserPhotoSettings',
				PATCH: 'modifyUserPhotoSettings'
			},
			water: {
				GET: "visitUserWaterSettings",
				PATCH: "modifyUserWaterSettings"
			},
			cert: {
				GET: 'visitUserCertPhotoSettings',
				PATCH: 'modifyUserCertPhotoSettings'
			},
			password: {
				GET: 'visitPasswordSettings',
				PATCH: 'modifyPassword'
			},
			mobile: {
				GET: 'visitMobileSettings',
				PATCH: 'modifyMobile',
				POST: 'bindMobile'
			},
			email: {
				GET: 'visitEmailSettings',
				POST: 'sendEmail',
				bind: {
					GET: 'bindEmail'
				},
				verify: {
					GET: 'changeEmail'
				}
			},
			verify: {
				PARAMETER: {
					GET: 'visitVerifySettings',
				}
			},
      'red_envelope': {
			  GET: 'visitUserRedEnvelopeSettings',
        PATCH: 'modifyUserRedEnvelopeSettings'
      }
		},
		auth: {
			GET: 'visitUserAuth',
			DELETE: 'cancelSubmitVerify',
			PARAMETER: {
				POST: 'submitVerify',
				PATCH: 'modifyUserVerifyStatus'
			}
		},
		collections: {
			PARAMETER: {
				GET: 'visitCollections',
				PATCH: 'modifyCollectionsCategory',
				DELETE: 'deleteCollection'
			}
		},
		drafts: {
			GET: 'visitDraftList',
			POST: 'addDraft',
			PARAMETER: {
				DELETE: 'deleteDraft'
			}
		},
		subscribe: {
			POST: 'subscribeUser',
			DELETE: 'unSubscribeUser',
			register: {
				GET: 'visitSubscribeForums',
				POST: 'submitSubscribeForums'
			}
		},
		bills: {
			GET: 'visitUserBills'
		},
		banner: {
			GET: 'getUserBanner',
			POST: 'modifyUserBanner'
		},
    friends: {
		  POST: 'sendAnApplicationToAddAFriend',
      agree: {
		    POST: 'agreeApplicationToAddAFriend'
      },
      disagree: {
		    POST: 'disagreeApplicationToAddAFriend'
      }
    }
	}
};