const { Operations } = require('../operations.js');
module.exports = {
  GET: Operations.visitFundHome,
  add: {
    GET: Operations.visitAddFund,
  },
  info: {
    GET: Operations.visitFundInfo,
  },
  bills: {
    GET: Operations.visitFundBills,
    POST: Operations.addFundBill,
    PARAMETER: {
      GET: Operations.visitFundBill,
      PUT: Operations.modifyFundBill,
      DELETE: Operations.deleteFundBill,
    },
  },
  bill: {
    GET: Operations.visitAddFundBill,
  },
  me: {
    GET: Operations.visitMyFund,
  },
  blacklist: {
    GET: Operations.visitFundBlacklist,
    POST: Operations.fundBlacklistPost,
    DELETE: Operations.fundBlacklistPost,
  },
  list: {
    GET: Operations.visitFundObjectList,
    POST: Operations.addFund,
    PARAMETER: {
      DELETE: Operations.deleteFundObject,
      GET: Operations.visitFundObjectHome,
      settings: {
        GET: Operations.singleFundSettings,
        PUT: Operations.singleFundSettings,
      },
      add: {
        GET: Operations.agreeFundTerms,
        POST: Operations.submitFundApplicationForm,
      },
      bills: {
        GET: Operations.visitFundObjectBills,
      },
    },
  },
  donation: {
    GET: Operations.fundDonation,
    POST: Operations.fundDonation,
    return: {
      GET: Operations.fundDonation,
    },
    verify: {
      POST: Operations.fundDonation,
    },
  },
  history: {
    GET: Operations.visitHistoryFundList,
    PARAMETER: {
      GET: Operations.visitHistoryFund,
    },
  },
  disabled: {
    GET: Operations.visitDisabledFundList,
  },
  unsubmit: {
    GET: Operations.visitUnSubmitFundApplicationList,
  },
  giveup: {
    GET: Operations.visitGiveUpFundApplicationList,
  },
  a: {
    PARAMETER: {
      GET: Operations.visitFundApplicationForm,
      POST: Operations.restoreFundApplicationForm,
      PUT: Operations.modifyApplicationForm,
      DELETE: Operations.deleteApplicationForm,
      report: {
        GET: Operations.visitFundApplicationReport,
        POST: Operations.addFundApplicationReport,
        audit: {
          GET: Operations.visitFundApplicationReportAudit,
          POST: Operations.submitFundApplicationReportAudit,
        },
        PARAMETER: {
          PUT: Operations.deleteFundApplicationReport,
        },
      },
      settings: {
        GET: Operations.visitFundApplicationFormSettings,
        POST: Operations.visitFundApplicationFormSettings,
        member: {
          POST: Operations.visitFundApplicationFormSettings,
          DELETE: Operations.visitFundApplicationFormSettings,
        },
        post: {
          GET: Operations.visitFundApplicationFormSettings,
        },
        delete: {
          POST: Operations.visitFundApplicationFormSettings,
        },
        giveup: {
          POST: Operations.visitFundApplicationFormSettings,
        },
        withdraw: {
          POST: Operations.visitFundApplicationFormSettings,
        },
      },
      manage: {
        audit: {
          project: {
            GET: Operations.visitFundApplicationAudit,
            POST: Operations.submitFundApplicationAudit,
          },
          info: {
            GET: Operations.visitFundApplicationAudit,
            POST: Operations.submitFundApplicationAudit,
          },
        },
        refuse: {
          POST: Operations.submitFundApplicationAudit,
        },
        restore: {
          POST: Operations.restoreFundApplicationForm,
        },
        stop: {
          POST: Operations.stopFundApplicationForm,
        },
        timeout: {
          POST: Operations.timeoutFundApplicationForm,
        },
        withdraw: {
          POST: Operations.withdrawFundApplicationForm,
        },
        refund: {
          POST: Operations.refundFundApplicationForm,
        },
      },
      /*comment: {
				POST: Operations.addFundApplicationComment,
				PARAMETER: {
					DELETE: Operations.deleteFundApplicationComment
				}
			},*/
      member: {
        PUT: Operations.modifyFundApplicationMember,
      },
      vote: {
        POST: Operations.submitFundApplicationVote,
      },
      audit: {
        GET: Operations.visitFundApplicationAudit,
        POST: Operations.submitFundApplicationAudit,
      },
      complete: {
        GET: Operations.visitFundApplicationComplete,
        POST: Operations.submitFundApplicationComplete,
        audit: {
          GET: Operations.visitFundApplicationCompleteAudit,
          POST: Operations.submitFundApplicationCompleteAudit,
        },
      },
      remittance: {
        GET: Operations.visitFundApplicationRemittance,
        POST: Operations.submitFundApplicationRemittance,
        apply: {
          GET: Operations.visitFundApplyRemittance,
          POST: Operations.submitFundApplyRemittance,
        },
        verify: {
          PUT: Operations.confirmationFundRemittance,
        },
      },
      excellent: {
        PUT: Operations.fundApplicationFormExcellent,
      },
      disabled: {
        PUT: Operations.modifyFundApplicationFormStatus,
      },
      refund: {
        GET: Operations.fundApplicationFormRefund,
        POST: Operations.fundApplicationFormRefund,
      },
    },
  },
};
