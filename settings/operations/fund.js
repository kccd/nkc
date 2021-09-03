module.exports = {
	GET: 'visitFundHome',
	add: {
		GET: 'visitAddFund'
	},
	info: {
		GET: 'visitFundInfo'
	},
	bills: {
		GET: 'visitFundBills',
		POST: 'addFundBill',
		PARAMETER: {
			GET: 'visitFundBill',
			PUT: 'modifyFundBill',
			DELETE: 'deleteFundBill'
		}
	},
	bill: {
		GET: 'visitAddFundBill'
	},
	me: {
		GET: 'visitMyFund'
	},
  blacklist: {
	  GET: 'visitFundBlacklist',
    POST: 'fundBlacklistPost',
    DELETE: 'fundBlacklistPost'
  },
	list: {
		GET: 'visitFundObjectList',
		POST: 'addFund',
		PARAMETER: {
			DELETE: 'deleteFundObject',
			GET: 'visitFundObjectHome',
			settings: {
				GET: 'singleFundSettings',
        PUT: 'singleFundSettings'
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
	unsubmit: {
		GET: 'visitUnSubmitFundApplicationList'
	},
	giveup: {
		GET: 'visitGiveUpFundApplicationList'
	},
	a: {
		PARAMETER: {
			GET: 'visitFundApplicationForm',
			POST: 'restoreFundApplicationForm',
			PUT: 'modifyApplicationForm',
			DELETE: 'deleteApplicationForm',
			report: {
				GET: 'visitFundApplicationReport',
				POST: 'addFundApplicationReport',
				audit: {
					GET: 'visitFundApplicationReportAudit',
					POST: 'submitFundApplicationReportAudit'
				},
				PARAMETER: {
					DELETE: 'deleteFundApplicationReport'
				}
			},
			settings: {
				GET: 'visitFundApplicationFormSettings',
        POST: 'visitFundApplicationFormSettings',
        member: {
				  POST: 'visitFundApplicationFormSettings',
          DELETE: 'visitFundApplicationFormSettings'
        },
        post: {
				  GET: 'visitFundApplicationFormSettings'
        },
        delete: {
				  POST: 'visitFundApplicationFormSettings'
        },
        giveup: {
				  POST: 'visitFundApplicationFormSettings'
        }
			},
      manage: {
			  audit: {
			    project: {
            GET: 'visitFundApplicationAudit',
            POST: 'submitFundApplicationAudit'
          },
          info: {
            GET: 'visitFundApplicationAudit',
            POST: 'submitFundApplicationAudit'
          }
        },
        refuse: {
			    POST: 'submitFundApplicationAudit'
        },
        restore: {
			    POST: 'restoreFundApplicationForm'
        },
        stop: {
			    POST: 'stopFundApplicationForm'
        },
        timeout: {
			    POST: 'timeoutFundApplicationForm'
        }
      },
			/*comment: {
				POST: 'addFundApplicationComment',
				PARAMETER: {
					DELETE: 'deleteFundApplicationComment'
				}
			},*/
			member: {
				PUT: 'modifyFundApplicationMember'
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
				POST: 'submitFundApplicationRemittance',
				apply: {
					GET: 'visitFundApplyRemittance',
					POST: 'submitFundApplyRemittance'
				},
				verify: {
					PUT: 'confirmationFundRemittance'
				}
			},
			excellent: {
				PUT: 'fundApplicationFormExcellent'
			},
			disabled: {
				PUT: 'modifyFundApplicationFormStatus'
			}
		}
	}
};
