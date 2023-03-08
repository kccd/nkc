const SettingModel = require('../../dataModels/SettingModel');

class ToolsService {
  async getSettingContentById(settingId = '') {
    const setting = await SettingModel.findOnly({_id: settingId}, {c: 1});
    return {...setting.c};
  }
}

module.exports = {
  toolsService: new ToolsService()
};
