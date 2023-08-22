const getRedisKeys = require('../../nkcModules/getRedisKeys');
const redisClient = require('../../settings/redisClient');
const { registerExamRateLimit } = require('../../settings/register');
const { ThrowForbiddenResponseTypeError } = require('../../nkcModules/error');
const { ResponseTypes } = require('../../settings/response');
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
}

module.exports = {
  registerExamService: new RegisterExamService(),
};
