const { settingIds } = require('../../settings/serverSettings');
module.exports = {
  _id: settingIds.username,
  c: {
    free: false,
    freeCount: 2,
    maxKcb: 20000,
    onceKcb: 2000,
    sensitive: {
      words: [],
      usernameTip: '用户名不合法',
      descTip: '个人简介不合法',
    },
  },
};
