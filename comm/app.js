const ApiService = require("moleculer-web");
const {GetWebConfigs} = require('./modules/configs');
const webConfigs = GetWebConfigs();
const mixins = webConfigs.enabled? [ApiService]: [];

const websocketAuth = require('./actions/auth/websocketAuth');
const setResourceStatus = require('./actions/resource/setResourceStatus');
const setVerifiedStatus = require('./actions/resource/setVerifiedStatus');
const setUserOnlineStatus = require('./actions/user/setUserOnlineStatus');
const getUserFriendsUid = require('./actions/user/getUserFriendsUid');
const checkUserPostPermission = require('./actions/user/checkUserPostPermission');
const checkUserForumPermission = require('./actions/user/checkUserForumPermission');

module.exports = {
  name: 'nkc',
  version: 1,
  mixins,
  settings: {
    port: webConfigs.port,
    host: webConfigs.host,
  },
  actions: {
    websocketAuth,
    setResourceStatus,
    setVerifiedStatus,
    setUserOnlineStatus,
    getUserFriendsUid,
    checkUserPostPermission,
    checkUserForumPermission,
  }
}
