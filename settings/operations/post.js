module.exports = {
	PARAMETER: {
		GET: 'visitPost',
		PATCH: 'modifyPost',
		quote: {
			GET: 'quotePost'
		},
		credit: {
			xsf: {
				POST: 'creditXsf'
			},
			kcb: {
				POST: 'creditKcb'
			}
		},
		disabled: {
			PATCH: 'disabledPost'
		},
		history: {
			GET: 'visitPostHistory',
			PATCH: 'disableHistories'
		},
		recommend: {
			POST: 'recommendPost',
			DELETE: 'unRecommendPost'
		}
	}
};