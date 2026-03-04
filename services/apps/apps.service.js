const SettingModel = require('../../dataModels/SettingModel');
const { getUrl } = require('../../nkcModules/tools');
class AppsService {
  async getApps() {
    const apps = [];
    const fundSettings = await SettingModel.getSettings('fund');
    const toolsSettings = await SettingModel.getSettings('tools');
    const radioSettings = await SettingModel.getSettings('radio');
    if (fundSettings.enableFund) {
      apps.push({
        name: `${fundSettings.fundName}`,
        abbr: `${fundSettings.fundName}`,
        url: '/fund',
        icon: getUrl('statics', 'apps/fund.png'),
      });
    }

    if (toolsSettings.enabled) {
      apps.push({
        name: '计算工具',
        abbr: '计算工具',
        url: `/tools`,
        icon: getUrl('statics', 'apps/tools.png'),
      });
    }
    if (radioSettings.enabled) {
      apps.push({
        name: radioSettings.name,
        abbr: radioSettings.abbr,
        url: '/receivers',
        icon: getUrl('statics', 'apps/radio.png'),
      });
    }
    apps.push({
      name: '考试系统',
      abbr: '考试系统',
      url: '/exam',
      icon: getUrl('statics', 'apps/exam.png'),
    });
    return apps;
  }
}

module.exports = {
  appsService: new AppsService(),
};
