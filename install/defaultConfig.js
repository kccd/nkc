const {randomBytes} = require('crypto');
module.exports = [
  {
    name: 'cookie',
    data: {
      secret: randomBytes(128).toString('hex').toString()
    }
  }
];