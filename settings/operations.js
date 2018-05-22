
// 通过url和请求方法确定操作类型
// PARAMETER代表url中不确定的值，如 '/u/uid/settings/info' 中的uid是个变化的值
// 所有操作类型在启动网站时被加载进内存，全局可访问global.NKC.operations

const methods = ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'];

const operationObj = {};


// 默认操作类型
const defaultOperations = [
	'displayExperimentalLink'
];


operationObj.operationTree = {
	home: {
		GET: 'visitHome',// 首页



		// ---------------------图片类--------------------
		// 用户头像
		avatar: {
			PARAMETER: {
				GET: 'getUserAvatar',
				POST: 'uploadUserAvatar'
			}
		},
		// 用户头像
		avatar_small: {
			PARAMETER: {
				GET: 'getUserAvatar',
			}
		},
		// 专业logo
		forum_avatar: {
			PARAMETER: {
				POST: 'updateForumImage',
				GET: 'getForumAvatar'
			}
		},
		// 资源
		r: {
			POST: 'uploadResources',
			PARAMETER: {
				GET: 'getResources'
			}
		},
		rt: {
			PARAMETER: {
				GET: 'getResources'
			}
		},
		// 文章封面图
		cover: {
			PARAMETER: {
				GET: 'getThreadCover'
			}
		},
		// 侧栏logo
		resources: {
			site_specific: {
				PARAMETER: {
					GET: 'getSiteSpecific'
				}
			}
		},
		// 默认图片
		default: {
			PARAMETER: {
				GET: 'getDefaultImage'
			}
		},
		// 专栏logo
		pfa: {
			PARAMETER: {
				GET: 'getPersonalForumAvatar'
			}
		},
		// 专栏banner
		pfb: {
			PARAMETER: {
				GET: 'getPersonalForumBanner'
			}
		},
		// 基金项目logo
		fundLogo: {
			POST: 'updateFundLogo',
			PARAMETER: {
				GET: 'getFundLogo'
			}
		},
		// 基金项目banner
		fundBanner: {
			POST: 'updateFundBanner',
			PARAMETER: {
				GET: 'getFundBanner'
			}
		},
		// 照片
		photo: {
			POST: 'uploadPhoto',
			PARAMETER: {
				GET: 'getPhoto'
			}
		},
		photo_small: {
			PARAMETER: {
				GET: 'getSmallPhoto'
			}
		},


		// ----------------------管理-------------------------
		e: {
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
				}
			},
			newSysInfo: {
				GET: 'visitSystemInfo',
				POST: 'sendSystemInfo'
			},
			log: {
				GET: 'visitLog'
			}
		},


		//---------------------专业---------------------
		f: {
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
		},

		//-----------------------文章-------------------------
		t: {
			GET: 'getThreadByQuery',
			PARAMETER: {
				GET: 'visitThread',
				POST: 'postToThread',
				moveThread: {
					PATCH: 'moveThread'
				},
				addColl: {
					POST: 'collectThread'
				},
				digest: {
					PATCH: 'digestThread'
				},
				topped: {
					PATCH: 'toppedThread'
				},
				switchInPersonalForum: {
					PATCH: 'switchInPersonalForum'
				},

			}
		},


		//----------------------用户-------------------------
		u: {
			PARAMETER: {
				GET: 'visitUserCard',
				banned: {
					PATCH: 'bannedUser'
				},
				settings: {
					GET: 'visitUserAvatarSettings',
					avatar: {
						GET: 'visitUserAvatarSettings',
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
						POST: 'bindEmail'
					},
					verify: {
						PARAMETER: {
							GET: 'visitVerifySettings',
						}
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
					register: {
						GET: 'visitSubscribeForums',
						POST: 'submitSubscribeForums'
					}
				}
			}
		},


		//----------------------身份认证审核---------------------
		auth: {
			GET: 'visitAuthList',
		},

		//----------------------编辑器-----------------------
		editor: {
			GET: 'visitEditor'
		},

		//----------------------自己------------------------
		me: {
			resource: {
				GET: 'getPersonalResources'
			},
			life_photos: {
				GET: 'getLifePhotos'
			}
		},


		//----------------------回复------------------------
		p: {
			PARAMETER: {
				GET: 'visitPost',
				PATCH: 'modifyPost',
				quote: {
					GET: 'quotePost'
				},
				credit: {
					PATCH: 'creditPost'
				},
				disabled: {
					PATCH: 'disabledPost'
				},
				history: {
					GET: 'visitPostHistory'
				}
			}
		},


		//-------------------------发送短信-----------------------
		sendMessage: {
			changeMobile: {
				POST: 'sendChangeMobileMessage'
			},
			bindMobile: {
				POST: 'sendBindMobileMessage'
			},
			register: {
				POST: 'sendRegisterMessage'
			},
			getback: {
				POST: 'sendGetBackPasswordMessage'
			}
		},


		//------------------------搜索------------------------
		search: {
			GET: 'search'
		},


		//------------------------专栏-----------------------
		m: {
			PARAMETER: {
				GET: 'visitPersonalForum',
				config: {
					PATCH: 'modifyPersonalForumInfo'
				}
			}
		},


		//------------------------信息----------------------
		sms: {
			GET: 'visitReplies',
			replies: {
				GET: 'visitReplies'
			},
			at: {
				GET: 'visitAt'
			},
			message: {
				GET: 'visitMessageList',
				POST: 'sendMessage',
				PARAMETER: {
					GET: 'visitMessage'
				}
			},
			system: {
				GET: 'visitSystemMessageList',
				PARAMETER: {
					GET: 'visitSystemMessage'
				}
			}
		},


		//-------------------------题库-----------------------
		q: {
			GET: 'visitQuestions',
			PARAMETER: {
				GET: 'visitQuestions',
				POST: 'addQuestion',
				PARAMETER: {
					GET: 'getQuestion',
					DELETE: 'deleteQuestion'
				}
			}
		},


		//-------------------------考试---------------------
		exam: {
			GET: 'visitExamPaperList',
			PARAMETER: {
				GET: 'getExamPaper',
				POST: 'submitExamPaper'
			}
		},

		//-------------------------注册----------------------
		register: {
			GET: 'visitMobileRegister',
			mobile: {
				GET: 'visitMobileRegister',
				POST: 'submitRegister'
			},
			code: {
				GET: 'getRegisterCode'
			}
		},


		//-------------------------登录---------------------
		login: {
			GET: 'visitLogin',
			POST: 'submitLogin'
		},


		//------------------------退出登录-------------------
		logout: {
			GET: 'logout'
		},


		//-------------------------基金---------------------
		fund: {
			GET: 'visitFundHome',
			add: {
				GET: 'visitAddFund'
			},
			settings: {
				GET: 'visitFundSettings',
				PATCH: 'modifyFundSettings'
			},
			info: {
				GET: 'visitFundInfo'
			},
			bills: {
				GET: 'visitFundBills',
				POST: 'addFundBill',
				PARAMETER: {
					GET: 'visitFundBill',
					PATCH: 'modifyFundBill',
					DELETE: 'deleteFundBill'
				}
			},
			bill: {
				GET: 'visitAddFundBill'
			},
			me: {
				GET: 'visitMyFund'
			},
			list: {
				GET: 'visitFundObjectList',
				POST: 'addFund',
				PARAMETER: {
					DELETE: 'deleteFundObject',
					PATCH: 'modifyFundObject',
					GET: 'visitFundObjectHome',
					settings: {
						GET: 'visitFundObjectSettings'
					},
					add: {
						GET: 'agreeFundTerms',
						POST: 'submitFundApplicationForm'
					},
					bills: {
						GET: 'visitFundObjectBills'
					}
				}
			},
			donation: {
				GET: 'fundDonation',
				POST: 'fundDonation',
				return: {
					GET: 'fundDonation'
				},
				verify: {
					POST: 'fundDonation'
				}
			},
			history: {
				GET: 'visitHistoryFundList',
				PARAMETER: {
					GET: 'visitHistoryFund'
				}
			},
			disabled: {
				GET: 'visitDisabledFundList'
			},
			a: {
				PARAMETER: {
					GET: 'visitFundApplicationForm',
					PATCH: 'modifyApplicationForm',
					DELETE: 'deleteApplicationForm',
					report: {
						GET: 'visitFundApplicationReport',
						POST: 'addFundApplicationReport',
						PARAMETER: {
							DELETE: 'deleteFundApplicationReport'
						},
						audit: {
							GET: 'visitFundApplicationReportAudit',
							POST: 'submitFundApplicationReportAudit'
						},
					},
					settings: {
						GET: 'visitFundApplicationFormSettings'
					},
					comment: {
						POST: 'addFundApplicationComment',
						PARAMETER: {
							DELETE: 'deleteFundApplicationComment'
						}
					},
					member: {
						PATCH: 'modifyFundApplicationMember'
					},
					vote: {
						POST: 'submitFundApplicationVote'
					},
					audit: {
						GET: 'visitFundApplicationAudit',
						POST: 'submitFundApplicationAudit'
					},
					complete: {
						GET: 'visitFundApplicationComplete',
						POST: 'submitFundApplicationComplete',
						audit: {
							GET: 'visitFundApplicationCompleteAudit',
							POST:'submitFundApplicationCompleteAudit'
						}
					},
					remittance: {
						GET: 'visitFundApplicationRemittance',
						POST: 'SubmitFundApplicationRemittance',
						apply: {
							GET: 'visitFundApplyRemittance',
							POST: 'submitFundApplyRemittance'
						},
						verify: {
							PATCH: 'confirmationFundRemittance'
						}
					},
					excellent: {
						PATCH: 'fundApplicationFormExcellent'
					},
					disabled: {
						PATCH: 'modifyFundApplicationFormStatus'
					}
				}
			}
		},
		//-------------------------- 报告问题 ------------------------
		problem: {
			add: {
				GET: 'visitAddProblem',
				POST: 'submitProblem'
			},
			list: {
				GET: 'visitProblemList',
				PARAMETER: {
					GET: 'visitProblem',
					PATCH: 'modifyProblem',
					DELETE: 'deleteProblem'
				}
			}
		}
	}
};


operationObj.getOperationsId = () => {
	const fn = (obj, arr) => {
		for(let key in obj) {
			if(!obj.hasOwnProperty(key)) continue;
			if(methods.includes(key)) {
				arr.push(obj[key]);
			} else {
				if(typeof obj[key] === 'object') {
					fn(obj[key], arr)
				}
			}
		}
	};
	const operations = defaultOperations.concat([]);
	fn(operationObj.operationTree, operations);
	return operations;
};

operationObj.getOperation = (url, method) => {
	let urlArr = [];
	url = url.replace(/\?.*/, '');
	if(url === '/') {
		urlArr = ['home'];
	} else {
		urlArr = url.split('/');
		urlArr[0] = 'home';
	}
	const fn = (obj, dKey) => {
		for(let key in obj) {
			if(!obj.hasOwnProperty(key)) continue;
			if(key === 'PARAMETER') {
				return obj['PARAMETER'];
			} else if(dKey === key) {
				return obj[key];
			}
		}
	};
	let obj = Object.assign({}, operationObj.operationTree);
	for(let i = 0 ; i < urlArr.length ; i++) {
		const key = urlArr[i];
		obj = fn(obj, key);
	}
	if(obj && typeof obj === 'object' && obj[method]) {
		return obj[method];
	} else {
		const error = new Error('not found');
		error.status = 404;
		throw error;
	}
};

module.exports = operationObj;