const request = require('request');
const queryString = require('querystring');
const moment = require('moment');
const crypto = require('crypto');

class nodeTransfer {
	config(obj) {
		const configObj = Object.assign({}, obj);
		this.rsa_private_key = configObj.rsa_private_key;
		this.alipay_public_key = configObj.alipay_public_key;
		this.configObj = configObj;
	}

	makeSign(params) {
		const sign = crypto.createSign('RSA-SHA256');
		const paramsStr = queryString.unescape(queryString.stringify(params));
		sign.update(paramsStr);
		return sign.sign(this.rsa_private_key, 'base64');
	}

	verifySign(params, sign) {
		const signStr = JSON.stringify(params);
		const verify = crypto.createVerify('RSA-SHA256');
		verify.update(signStr);
		return verify.verify(this.alipay_public_key, sign, 'base64');
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
		signObj.sign = this.makeSign(signObj, 'private');
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
					const publicSign = this.verifySign(alipay_fund_trans_toaccount_transfer_response, sign);
					if(!publicSign) {
						reject(`验签失败！`);
					}
					const {code, msg, order_id, out_biz_no, pay_date, sub_code} = alipay_fund_trans_toaccount_transfer_response;
					if(code === '10000') {
						resolve({
							id: out_biz_no,
							alipayId: order_id,
							timestamp: pay_date
						});
					} else {
						reject(`转账失败！ code: ${code}, msg: ${msg}, sub_code: ${sub_code}`);
					}
				}
			})
		})
	}
}
const alipay = {};

alipay.transfer = (obj) => {
	const {transferConfig, transferParams} = require('../settings/alipay');
	const {account, money, notes, id} = obj;
	transferParams.out_biz_no = id;
	transferParams.payee_account = account;
	transferParams.amount = money;
	transferParams.remark = notes;
	const transfer = new nodeTransfer();
	transfer.config(transferConfig);
	return transfer.request(transferParams)
};

module.exports = alipay;