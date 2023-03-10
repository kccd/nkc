const SensitiveSettingModel = require('../../dataModels/SensitiveSettingModel');
const { translateSensitiveSettingName } = require('../../nkcModules/translate');
const { ThrowServerInternalError } = require('../../nkcModules/error');

class SensitiveSettingService {
  async createSetting(props) {
    const { iid, groupIds, desc, enabled } = props;
    const setting = new SensitiveSettingModel({
      iid,
      groupIds,
      desc,
      enabled,
    });
    await setting.save();
    return setting;
  }

  async getSettingById(id) {
    const setting = await SensitiveSettingModel.findOne({ iid: id });
    if (!setting) {
      ThrowServerInternalError(`sensitiveSetting id error. (id=${id})`);
    }
    return setting;
  }

  async getSettingsByIds(ids) {
    return SensitiveSettingModel.find({ iid: { $in: ids } });
  }

  async getAllSettings(match = {}, filter = {}) {
    return SensitiveSettingModel.find(match, filter).sort({ _id: 1 });
  }

  async getAllSettingsDetail(language) {
    const settings = await this.getAllSettings(
      {},
      {
        iid: 1,
        enabled: 1,
        groupIds: 1,
        desc: 1,
      },
    );
    return settings.map((setting) => {
      const { iid, enabled, groupIds, desc } = setting;
      return {
        iid,
        enabled,
        groupIds,
        desc,
        name: translateSensitiveSettingName(language, iid),
      };
    });
  }

  async updateSetting(props) {
    const { iid, enabled, desc, groupIds } = props;
    await SensitiveSettingModel.updateOne(
      { iid },
      {
        $set: {
          enabled,
          desc,
          groupIds,
        },
      },
    );
  }
}

module.exports = {
  sensitiveSettingService: new SensitiveSettingService(),
};
