const {transferConfig} = require('./alipaySecret');
module.exports = {
	transferConfig,
	transferParams: {
		payee_type: 'ALIPAY_LOGONID',
		payer_show_name: '科创基金'
	}
};