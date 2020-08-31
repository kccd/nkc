const QCloudSms = require('qcloudsms_js');
module.exports = async (smsSettings, obj) => {
  const {templateId, timeout, code, mobile, nationCode} = obj;
  const {appId, appKey, smsSign} = smsSettings;

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
  });
}
