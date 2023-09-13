const { settingIds } = require('../../settings/serverSettings');
module.exports = {
  _id: settingIds.verification,
  c: {
    enabledTypes: [],
    countLimit: {
      time: 60,
      count: 30,
    },
    login: {
      enabled: false,
      type: 'vernierCaliper',
    },
    register: {
      enabled: false,
      type: 'vernierCaliper',
    },
  },
};
