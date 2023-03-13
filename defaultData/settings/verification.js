const { settingIds } = require('../../settings/serverSettings');
module.exports = {
  _id: settingIds.verification,
  c: {
    enabledTypes: [],
    countLimit: {
      time: 60,
      count: 30,
    },
  },
};
