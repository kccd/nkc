module.exports = {
	GET: 'visitAppDownload',
  upgrade: {
    GET: 'APPUpgrade',
  },
	location: {
		GET: "selectLocation",
	},
	check: {
		GET: 'APPcheckout',
	},
	nav: {
		GET: "APPGetNav"
	},
	my: {
		GET: "APPGetMy"
	},
  account: {
    GET: 'APPGetAccountInfo'
  },
	download: {
		GET: "appGetDownload"
	},
	scoreChange: {
		PARAMETER: {
			GET: 'APPgetScoreChange'
		}
	},
	android: {
		PARAMETER: {
			GET: 'downloadApp'
		}
	},
	ios: {
		PARAMETER: {
			GET: 'downloadApp'
		}
	}
};
