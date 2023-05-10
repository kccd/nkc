const { settingIds } = require('../../settings/serverSettings');
module.exports = {
  _id: settingIds.counters,
  c: {
    users: 0,
    posts: 0,
  },
};
