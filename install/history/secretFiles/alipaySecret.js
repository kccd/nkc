const fs = require('fs');
const path = require('path');
let privateKey = '', publicKey = '';
if(fs.existsSync(path.resolve(__dirname, '../key/rsa_private_key.pem')) && fs.existsSync(path.resolve(__dirname, '../key/alipay_public_key.pem'))) {
  privateKey = fs.readFileSync(path.resolve(__dirname, '../key/rsa_private_key.pem'));
  publicKey = fs.readFileSync(path.resolve(__dirname, '../key/alipay_public_key.pem'));
}
const params = {
	directConfig: {
		seller_email: 'kc@kc.ac.cn',
		partner: '2088921873769992',
		key: '6pjwhh2w855eo4fpolt2wnogu41oey36',
		return_url: 'http://localhost:9000/fund/donation/return',
		notify_url: 'https://www.kechuang.org/fund/donation/verify'
	},
	transferConfig: {
		app_id: '2016091100489000',
		sign_type: 'RSA2',
		rsa_private_key: privateKey,
		alipay_public_key: publicKey,
		gateway: 'https://openapi.alipaydev.com/gateway.do?'
	}
};

if(process.env.NODE_ENV === 'production') {
	params.directConfig.return_url = 'https://www.kechuang.org/fund/donation/return';
	params.transferConfig.app_id = '2018031902407408';
	params.transferConfig.gateway = 'https://openapi.alipay.com/gateway.do?';
}

module.exports = params;