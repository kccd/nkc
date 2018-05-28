module.exports = {
	GET: 'visitReplies',
	replies: {
		GET: 'visitReplies'
	},
	at: {
		GET: 'visitAt'
	},
	message: {
		GET: 'visitMessageList',
		POST: 'sendMessage',
		PARAMETER: {
			GET: 'visitMessage'
		}
	},
	system: {
		GET: 'visitSystemMessageList',
		PARAMETER: {
			GET: 'visitSystemMessage'
		}
	}
};