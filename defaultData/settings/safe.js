module.exports = {
  _id: 'safe',
  c: {
    experimentalVerifyPassword: false,
    experimentalTimeout: 30, // 超时时间30分钟
    experimentalPassword: {
      hash: '',
      salt: '',
      secret: ''
    },
    phoneVerify: {
      enable: false,
      interval: 90 * 24
    }
  }
};