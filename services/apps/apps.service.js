const SettingModel = require('../../dataModels/SettingModel');
const { getUrl } = require('../../nkcModules/tools');
class AppsService {
  async getApps() {
    const apps = [];
    const fundSettings = await SettingModel.getSettings('fund');
    const toolsSettings = await SettingModel.getSettings('tools');
    if (fundSettings.enableFund) {
      apps.push({
        name: `${fundSettings.fundName}`,
        url: '/fund',
        icon: getUrl('statics', 'apps/fund.png'),
      });
    }
    if (toolsSettings.enabled) {
      apps.push({
        name: '计算工具',
        url: `/tools`,
        icon: getUrl('statics', 'apps/tools.png'),
      });
    }
    return apps;
  }
}

module.exports = {
  appsService: new AppsService(),
};
