const alidayu = require("./alidayu");
const aliCloud = require('./aliCloud');
const tencentCloud = require('./tencentCloud');

const sendMessage = async (obj) => {
  if(global.NKC.NODE_ENV !== "production") {
    return console.log(obj);
  }
  const SettingModel = require('../../dataModels/SettingModel');
  const smsSettings = await SettingModel.getSettings('sms');
  const {type} = obj;
  const {templates} = smsSettings;
  let templateId, timeout, content;
  for(const template of templates) {
    if(template.name === type) {
      templateId = template.id;
      timeout = template.validityPeriod;
      content = template.content;
      break;
    }
  }
  if(templateId === undefined) throw `${type}模板未定义`;
  content = content
    .replace(/{code}/g, obj.code)
    .replace(/{time}/g, timeout);
  obj = Object.assign({}, obj, {templateId, timeout, content});
  if(smsSettings.platform === 'aliCloud') {
    return aliCloud(smsSettings, obj);
  } else if(smsSettings.platform === 'alidayu'){
    return alidayu(smsSettings, obj);
  } else {
    return tencentCloud(smsSettings, obj);
  }
};

module.exports = sendMessage;
