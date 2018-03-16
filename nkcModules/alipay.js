const request = require('request');
const queryString = require('querystring');
const fs = require('fs');
const moment = require('moment');
const path = require('path');
const crypto = require('crypto');

class nodeTransfer {
	constructor() {
		this.signType = {
			RSA: "RSA-SHA1",
			RSA2: "RSA-SHA256"
		};
	}


	config(obj) {
		const configObj = Object.assign({}, obj);
		this.rsa_private_key = fs.readFileSync(path.resolve(configObj.rsa_private_key));
		this.rsa_public_key = fs.readFileSync(path.resolve(configObj.rsa_public_key));
		this.configObj = configObj;
	}

	getSign(params, keyType) {
		const paramsStr = queryString.unescape(queryString.stringify(params));
		const sign = crypto.createSign(this.signType[params.sign_type]);
		sign.update(paramsStr);
		let key = this.rsa_private_key;
		if(keyType === 'public') {
			key = this.rsa_public_key;
		}
		return sign.sign(key, 'base64');
	}

	getUrl(params) {
		const paramsStr = JSON.stringify(params);
		const configObj = this.configObj;
		const signObj = {
			app_id: configObj.app_id,
			biz_content: paramsStr,
			charset: 'utf-8',
			method: 'alipay.fund.trans.toaccount.transfer',
			sign_type: configObj.sign_type,
			timestamp: moment().format(`YYYY-MM-DD HH:mm:ss`),
			version: '1.0'
		};
		signObj.sign = this.getSign(signObj, 'private');
		return `https://openapi.alipaydev.com/gateway.do?` + queryString.stringify(signObj);
	}

	request(params) {
		const url = this.getUrl(params);
		return new Promise((resolve, reject) => {
			request(url, (err, res, body) => {
				if(err) {
					reject(err);
				} else {
					body = JSON.parse(body);
					const {sign, alipay_fund_trans_toaccount_transfer_response} = body;
					const publicSign = this.getSign(alipay_fund_trans_toaccount_transfer_response, 'public');
					if(sign !== publicSign) {
						console.log(sign);
						console.log(publicSign);
						reject('sign值不想等');
					}

					const {code, msg, order_id, out_biz_no, pay_date, sub_code} = alipay_fund_trans_toaccount_transfer_response;
					if(code === '10000') {
						resolve({
							id: out_biz_no,
							alipayId: order_id,
							timestamp: pay_date
						});
					} else {
						reject(`转账失败。 code: ${code}, msg: ${msg}, sub_code: ${sub_code}`);
					}
				}
			})
		})
	}
}

const config = {
	app_id: '',
	sign_type: 'RSA2',
	rsa_private_key: './key/rsa_private_key.pem',
	rsa_public_key: './key/rsa_public_key.pem',
};
const params = {
	out_biz_no: Date.now(),
	payee_type: 'ALIPAY_LOGONID',
	payee_account: '',
	amount: '520',
	payer_show_name: '科创基金',
	remark: '来自测试'
};

const alipay = {};

alipay.nodeTransfer = nodeTransfer;


module.exports = alipay;