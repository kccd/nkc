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
  }
];