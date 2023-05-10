const { settingIds } = require('../../settings/serverSettings');
module.exports = {
  _id: settingIds.subscribe,
  c: {
    // 关注用户数量限制
    subUserCountLimit: 1000,
    // 关注专业数量限制
    subForumCountLimit: 20,
    // 关注文章数量限制
    subThreadCountLimit: 10000,
  },
};
