const getRedisKeys = require('../../nkcModules/getRedisKeys');
const redisClient = require('../../settings/redisClient');
const SettingModel = require('../../dataModels/SettingModel');
const { registerExamRateLimit } = require('../../settings/register');
const {
  ThrowForbiddenResponseTypeError,
  ThrowBadRequestResponseTypeError,
} = require('../../nkcModules/error');
const { ResponseTypes } = require('../../settings/response');
const {
  activationCodeService,
} = require('../activationCode/activationCode.service');
class RegisterExamService {
  async accessRateLimit(address) {
    const timeKey = getRedisKeys('registerExamLimitTime', address);
    const countKey = getRedisKeys('registerExamLimitCount', address);

    let time = await redisClient.getAsync(timeKey);
    let count = await redisClient.getAsync(countKey);

    time = time ? Number(time) : Date.now();
    count = count ? Number(count) : 1;

    const now = Date.now();

    if (now - Number(time) <= registerExamRateLimit.time) {
      // 时间未超过
      if (Number(count) >= registerExamRateLimit.count) {
        // 次数达到最大值，等待
        ThrowForbiddenResponseTypeError(
          ResponseTypes.FORBIDDEN_REGISTER_EXAM_CHECK_RATE_LIMIT,
        );
      } else {
        count += 1;
      }
    } else {
      time = now;
      count = 1;
    }
    await redisClient.setAsync(timeKey, time);
    await redisClient.setAsync(countKey, count);
  }

  async getRegisterCodeStatus(registerActivationCode) {
    const { registerExamination: isExamEnabled } =
      await SettingModel.getSettings('register');
    const data = await SettingModel.getSettings('verification');
    // console.log('5555', data);
    let isExamRequired = false;
    let isValidCode = false;
    if (isExamEnabled) {
      isExamRequired = true;
      if (registerActivationCode) {
        const valid = await activationCodeService.isActivationCodeValid(
          registerActivationCode,
        );
        if (valid) {
          isExamRequired = false;
          isValidCode = true;
        }
      }
    }
    return {
      isExamRequired,
      isExamEnabled,
      isValidCode,
      login: data.login,
      register: data.register,
    };
  }

  async getRegisterExamCode() {
    const codeId = await SettingModel.getNewId();
    const codeValue = [
      Math.round(Math.random() * 10),
      Math.round(Math.random() * 10),
    ];
    const sum = codeValue[0] + codeValue[1];
    const codeKey = getRedisKeys('registerExamCode', codeId);
    await redisClient.setWithTimeoutAsync(codeKey, sum, 120);
    return {
      codeId,
      codeValue,
    };
  }

  async checkRegisterExamCode(codeId, result) {
    const codeKey = getRedisKeys('registerExamCode', codeId);
    const sum = await redisClient.getAsync(codeKey);
    if (sum !== result) {
      ThrowBadRequestResponseTypeError(
        ResponseTypes.INVALID_REGISTER_EXAM_CODE,
      );
    }
    await redisClient.delAsync(codeKey);
  }
}

module.exports = {
  registerExamService: new RegisterExamService(),
};
