const {settingIds} = require('../../settings/serverSettings');
module.exports = {
  _id: settingIds.cache,
  c: {
    visitorPageCacheTime: 180
  }
};