const {randomBytes} = require('crypto');
module.exports = [
  {
    name: 'email',
    data: {
      smtpConfig: {
        host: 'smtp.exmail.qq.com',
        port: 465,
        secure: true, // use SSL
        auth: {
          user: 'user',
          pass: 'pass'
        }
      },
      exampleMailOptions: {
        from: '*'
      }
    }
  },
  {
    name: 'cookie',
    data: {
      secret: randomBytes(128).toString('hex').toString()
    }
  },
  {
    name: 'sms',
    data: {
      appId: 0,
      appKey: "0",
      smsSign: '0',
      templateId: {
        register: 0,
        reset: 0,
        getback: 0,
        bindMobile: 0,
        login: 0,
        changeMobile: 0,
      }
    }
  }
];