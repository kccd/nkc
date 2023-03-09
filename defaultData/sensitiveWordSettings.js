const {sensitiveSettingIds} = require('../settings/sensitiveSetting');
const {translate} = require('../nkcModules/translate');
const settingIds = Object.values(sensitiveSettingIds);

module.exports = settingIds.map(iid => {
  const name = translate('zh_cn', 'sensitiveSettings', iid)
  return {
    iid,
    enabled: false,
    desc: `${name}中包含敏感词`,
    groupIds: []
  };
})