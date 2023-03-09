const SensitiveSettingModel = require('../../dataModels/SensitiveSettingModel');
const {translateSensitiveSettingName} = require('../../nkcModules/translate');
const {sensitiveDetectionService} = require('./sensitiveDetection.service');
const {ThrowBadRequestResponseTypeError, ThrowServerInternalError} = require('../../nkcModules/error');
const {ResponseTypes} = require('../../settings/response');
const {sensitiveSettingIds} = require('../../settings/sensitiveSetting');

class SensitiveSettingService {
  async createSetting(props) {
    const {iid, groupIds, desc, enabled} = props;
    const setting = new SensitiveSettingModel({
      iid,
      groupIds,
      desc,
      enabled
    });
    await setting.save();
    return setting;
  }

  async getSettingById(id) {
    const setting = await SensitiveSettingModel.findOne({iid: id});
    if(!setting) {
      ThrowServerInternalError(`sensitiveSetting id error. (id=${id})`);
    }
    return setting;
  }

  async getSettingsByIds(ids) {
    return SensitiveSettingModel.find({iid: {$in: ids}});
  }

  async getAllSettings(match = {}, filter = {}) {
    return SensitiveSettingModel.find(match, filter).sort({_id: 1});
  }

  async getAllSettingsDetail(language) {
    const settings = await this.getAllSettings({}, {
      iid: 1,
      enabled: 1,
      groupIds: 1,
      desc: 1,
    });
    return settings.map(setting => {
      const {iid, enabled, groupIds, desc} = setting;
      return {
        iid,
        enabled,
        groupIds,
        desc,
        name: translateSensitiveSettingName(language, iid)
      }
    })
  }

  async updateSetting(props) {
    const {iid, enabled, desc, groupIds} = props;
    await SensitiveSettingModel.updateOne({iid}, {
      $set: {
        enabled,
        desc,
        groupIds
      }
    });
  }

  async contentDetection(iid, content) {
    const {
      enabled, desc, groupIds
    } = await this.getSettingById(iid);
    if(enabled && groupIds.length > 0) {
      const isSensitiveContent = await sensitiveDetectionService.isSensitiveContent(content, groupIds);
      if(isSensitiveContent) {
        ThrowBadRequestResponseTypeError(ResponseTypes.IS_SENSITIVE_CONTENT, desc)
      }
    }
  }

  async usernameDetection(content) {
    await this.contentDetection(sensitiveSettingIds.username, content);
  }

  async userDescDetection(content) {
    await this.contentDetection(sensitiveSettingIds.userDesc, content);
  }

  async columnNameDetection(content) {
    await this.contentDetection(sensitiveSettingIds.columnName, content);
  }

  async columnDescDetection(content) {
    await this.contentDetection(sensitiveSettingIds.columnDesc, content);
  }
}

module.exports = {
  sensitiveSettingService: new SensitiveSettingService()
};