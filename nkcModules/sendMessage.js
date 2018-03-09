const QCloudSms = require('qcloudsms_js');
const smsSecrets = require('../settings/smsSecrets');
const {appId, appKey, smsSign} = smsSecrets;
const qCloudSms = QCloudSms(appId, appKey);
const sSender = qCloudSms.SmsSingleSender();

const sendMessage = async (obj) => {
	return new Promise((resolve, reject) => {
		const callback = (err, res, resData) => {
			if(err) {
				reject(err);
			} else {
				const {result, errmsg} = resData;
				if(result !== 0) {
					reject(new Error(`发送短信失败, 错误码: ${result}, 错误信息: "${errmsg}"`));
				} else {
					resolve(resData);
				}
			}
		};
		const {type, code, mobile} = obj;
		const nationCode = obj.nationCode?parseInt(obj.nationCode): 86;
		const params = [code];
		const templateId = smsSecrets.templateId[type];
		sSender.sendWithParam(nationCode, mobile, templateId, params, smsSign, "", "", callback);
	})
};

module.exports = sendMessage;