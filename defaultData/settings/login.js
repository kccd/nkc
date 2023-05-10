const { settingIds } = require('../../settings/serverSettings');
module.exports = {
  _id: settingIds.login,
  c: {
    login: {
      ipCountLimit: 10,
      mobileCountLimit: 10,
      usernameCountLimit: 10,
    },
    resetPassword: {
      ipCountLimit: 10,
      mobileCountLimit: 10,
      usernameCountLimit: 10,
      emailCountLimit: 10,
    },
  },
};
