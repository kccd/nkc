module.exports = {
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
			PATCH: 'modifyApplicationForm',
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
				GET: 'visitFundApplicationFormSettings'
			},
			/*comment: {
				POST: 'addFundApplicationComment',
				PARAMETER: {
					DELETE: 'deleteFundApplicationComment'
				}
			},*/
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
				POST: 'submitFundApplicationRemittance',
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
};