const TopClient = require('./topClient').TopClient;
module.exports = async (smsSettings, obj) => {
  const {templateId, timeout, content, nationCode} = obj;
  const mobile = nationCode === '86'? obj.mobile: nationCode + obj.mobile;
  const {appId, appKey, smsSign} = smsSettings;
  const client = new TopClient({
    appkey: appId,
    appsecret: appKey,
    REST_URL: 'http://gw.api.taobao.com/router/rest'
  });
  return new Promise((resolve, reject) => {
    client.execute('alibaba.aliqin.fc.sms.num.send', {
      'sms_type':'normal',
      'sms_free_sign_name': smsSign,
      'sms_param':{
        code: content,
        minutes: timeout + ''
      },
      'rec_num': mobile,
      'sms_template_code': templateId,
    }, function(error, response) {
      if(error) {
        reject(error);
      } else {
        resolve(response);
      }
    })
  });
};
