module.exports = {
	GET: 'visitAppDownload',
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
