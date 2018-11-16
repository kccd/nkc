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
			PATCH: 'disableHistories',
			rollback: {
				PARAMETER: {
					GET: 'rollbackPost'
				}
			}
		},
		recommend: {
			POST: 'recommendPost',
			DELETE: 'unRecommendPost'
		},
		digest: {
			POST: 'digestPost',
			DELETE: 'unDigestPost'
		},
    vote: {
		  up: {
		    POST: 'post-vote-up'
      },
      down: {
		    POST: 'post-vote-down'
      }
    }
	}
};