const Cookies = require('cookies-string-parse');
const { isDevelopment } = require('../settings/env');
const cookieConfig = require('../config/cookie');
const KeyGrip = require('keygrip');
const { isBase64 } = require('./base64');

const cookieKeys = new KeyGrip([cookieConfig.secret], 'sha256');

function getCookieKeys() {
  return cookieKeys;
}

function getCookieInfo(cookie = '', key) {
  let keyInfo = null;
  try {
    const cookies = new Cookies(cookie, {
      keys: getCookieKeys(),
    });
    let result = cookies.get(key, {
      signed: true,
    });
    if (result) {
      keyInfo = result;
    }
  } catch (err) {
    if (isDevelopment) {
      console.error(err);
    }
  }
  return keyInfo;
}

function getUserInfo(cookie = '') {
  let userInfo = null;
  try {
    if (isBase64(cookie)) {
      cookie = Buffer.from(cookie, 'base64').toString();
    }
    let result = getCookieInfo(cookie, 'userInfo');
    if (result) {
      result = Buffer.from(result, 'base64').toString();
      userInfo = JSON.parse(result);
    }
  } catch (err) {
    if (isDevelopment) {
      console.error(err);
    }
  }
  return userInfo;
}

module.exports = {
  getCookieInfo,
  getCookieKeys,
  getUserInfo,
};
