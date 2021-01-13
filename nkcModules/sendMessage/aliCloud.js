const Core = require('@alicloud/pop-core');
module.exports = async (smsSettings, obj) => {
  const {templateId, timeout, content, mobile, nationCode} = obj;
  const {appId, appKey, smsSign} = smsSettings;

  const client = new Core({
    accessKeyId: appId,
    accessKeySecret: appKey,
    endpoint: 'https://dysmsapi.aliyuncs.com',
    apiVersion: '2017-05-25'
  });
  const params = {
    RegionId: 'cn-hangzhou',
    PhoneNumbers: `${nationCode}${mobile}`,
    SignName: smsSign,
    TemplateCode: templateId,
    TemplateParam: JSON.stringify({code: content, minutes: timeout + ''})
  };
  const requestOption = {
    method: 'POST'
  };
  return client.request('SendSms', params, requestOption);
}
