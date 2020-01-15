module.exports = {
	GET: 'visitAppDownload',
	me: {
		GET: 'APPgetLoginUserInfo',
	},
	check: {
		GET: 'APPcheckout',
	},
	nav: {
		GET: "APPGetNav"
	},
	scoreChange: {
		PARAMETER: {
			GET: 'APPgetScoreChange'
		}
	},
	android: {
		PARAMETER: {
			GET: 'getAndroidPackage'
		}
	},
	ios: {
		PARAMETER: {
			GET: 'getIosPackage'
		}
	}
};