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
	profile: {
		GET: "appVisitProfile",
		sub: {
			GET: "appVisitProfile",
			user: {
				GET: "appVisitProfile",
			},
			forum: {
				GET: "appVisitProfile",
			},
			column: {
				GET: "appVisitProfile",
			},
			thread: {
				GET: "appVisitProfile",
			},
			fan: {
				GET: "appVisitProfile",
			},
			follower: {
				GET: "appVisitProfile",
			},
		},
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
