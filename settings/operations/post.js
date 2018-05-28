module.exports = {
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
			GET: 'visitPostHistory',
			PATCH: 'disableHistories'
		}
	}
};