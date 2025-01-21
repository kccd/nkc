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
    defaultLoginType: {
      app: 'sms',
      mobile: 'sms',
      desktop: 'qr',
    },
    QRWarning:
      '您正在通过APP扫码登录网站，请确认是您本人的操作。若信息无误，请点击下方确认按钮完成登录。',
  },
};
