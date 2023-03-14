const SensitiveSettingModel = require('../../dataModels/SensitiveSettingModel');
const redisClient = require('../../settings/redisClient');
const { translateSensitiveSettingName } = require('../../nkcModules/translate');
const {
  ThrowServerInternalError,
  ThrowBadRequestResponseTypeError,
} = require('../../nkcModules/error');
const { sensitiveTypes } = require('../../settings/sensitiveSetting');
const { ResponseTypes } = require('../../settings/response');
const getRedisKeys = require('../../nkcModules/getRedisKeys');

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

  async getSettingByIdFromCache(id) {
    const settings = await this.getAllSettingsFromCache();
    for (const setting of settings) {
      if (setting.iid === id) {
        return setting;
      }
    }
    ThrowServerInternalError(`sensitiveSetting id error. (id=${id})`);
  }

  async saveAllSettingsToCache() {
    const settings = await this.getAllSettings();
    const key = getRedisKeys('sensitiveSettings');
    await redisClient.setAsync(key, JSON.stringify(settings));
  }

  async getAllSettingsFromCache() {
    const key = getRedisKeys('sensitiveSettings');
    let settings = await redisClient.getAsync(key);
    return JSON.parse(settings);
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

  async checkSensitiveType(type) {
    const types = Object.values(sensitiveTypes);
    if (!types.includes(type)) {
      ThrowBadRequestResponseTypeError(
        ResponseTypes.SENSITIVE_TYPE_ERROR,
        type,
      );
    }
  }
}

module.exports = {
  sensitiveSettingService: new SensitiveSettingService(),
};
