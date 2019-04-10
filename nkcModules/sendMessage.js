const QCloudSms = require('qcloudsms_js');
const mongoose = require('mongoose');

const sendMessage = async (obj) => {
  if(global.NKC.NODE_ENV !== "production") {
    return console.log(obj);
  }
  const {type, code, mobile, nationCode} = obj;
  const SettingModel = mongoose.model('settings');
  const smsSettings = await SettingModel.findOnly({_id: 'sms'});
  const {templates, appId, appKey, smsSign} = smsSettings.c;
  let templateId;
  for(const template of templates) {
    if(template.name === type) {
      templateId = template.id;
      break;
    }
  }
  if(templateId === undefined) throw `${type}模板未定义`;
  const qCloudSms = QCloudSms(appId, appKey);
  const sSender = qCloudSms.SmsSingleSender();
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
		const params = [code];
		sSender.sendWithParam(nationCode?parseInt(nationCode):86, mobile, templateId, params, smsSign, "", "", callback);
	})
};

module.exports = sendMessage;