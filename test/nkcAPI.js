const supertest = require('supertest');
const serverConfig = require('../config/server.json');
const api = supertest(`${serverConfig.domain}:${serverConfig.port}`);
const {users} = require('./config.js');
module.exports = function(path, method, accept = 'json', userType) {
  let _api = api[method.toLowerCase()](path);
  _api = _api.set('FROM', 'nkcAPI');
  accept = accept.toLowerCase() === 'html'? 'text/html': 'application/json';
  _api = _api.set('Accept', accept);
  let cookie;
  if(userType) {
    for(const u of users) {
      if(userType === u.type) {
        cookie = u.cookie;
        break;
      }
    }
  }
  if(cookie) {
    _api = _api.set('Cookie', cookie);
  }
  return _api;
};
