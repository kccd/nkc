const { settingIds } = require('../../settings/serverSettings');
module.exports = {
  _id: settingIds.radio,
  c: {
    enabled: false,
    name: '科创电台',
    description: '科创电台介绍',
    permission: {
      allowVisitor: false,
      authLevel: 0,
      onlyAllowChineseMobile: false,
      onlyAllowChineseIP: false,
    },
    admin: [],
    serviceUrl: 'http://127.0.0.1:18080',
  },
};
