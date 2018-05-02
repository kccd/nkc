module.exports = {
  updateActiveUsersCronStr: '0 0 4 * * *', //定时更新活跃用户的cron表达式，现在是4:00每天
  truncateUsersLoggedToday: '0 0 0 * * *', //每天12点清除当天登录过的用户--登录奖励
};