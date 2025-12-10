// 触发审核的原因
const reviewTriggerType = {
  required: 'required', // 系统强制要求审核
  blacklist: 'blacklist', // 黑名单用户
  foreign: 'foreign', // 地区限制
  notPassedA: 'notPassedA', // 未通过A卷
  grade: 'grade', // 用户等级太低
  unverifiedPhone: 'unverifiedPhone', // 未验证手机号
  forumSettingReview: 'forumSettingReview', // 满足论坛专业设置要求审核的条件
  notPassedAD: 'notPassedAD',
  sensitiveWord: 'sensitiveWord', // 包含敏感词
};
// 触发审核的内容的来源
const reviewSources = {
  document: 'document',
  note: 'note',
  post: 'post',
  user: 'user',
};
// 管理员对审核内容的操作
const reviewStatus = {
  pending: 'pending', // 等待审核
  approved: 'approved', // 批准
  revised: 'revised', // 已退回
  deleted: 'deleted', // 删除
  invalid: 'invalid', // 无效（可能产生了新的审核记录）
};

module.exports = {
  reviewTriggerType,
  reviewSources,
  reviewStatus,
};
