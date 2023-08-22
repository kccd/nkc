// 注册前校验注册码的频次限制
const registerExamRateLimit = {
  time: 10 * 60 * 1000, // 毫秒数
  count: 10, // 次数
};
module.exports = {
  registerExamRateLimit,
};
