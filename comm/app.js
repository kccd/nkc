const ApiService = require("moleculer-web");
const websocketAuth = require('./actions/auth/websocket');
module.exports = {
  name: 'nkc',
  version: 1,
  mixins: [ApiService],
  actions: {
    websocketAuth
  }
}
