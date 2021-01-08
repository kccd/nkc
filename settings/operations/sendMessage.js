module.exports = {
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
	},
	login: {
		POST: 'sendLoginMessage'
	},
  withdraw: {
	  POST: "sendWithdrawMessage"
  },
	destroy: {
		POST: "sendDestroyMessage"
	},
	unbindMobile: {
		POST: "sendUnbindMobileMessage"
	},
	common: {
		POST: "sendPhoneMessage",
	}
};
