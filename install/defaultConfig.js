const {randomBytes} = require('crypto');
module.exports = [
  {
    name: 'cookie',
    data: {
      secret: randomBytes(128).toString('hex').toString(),
      maxAge: 604800000
    }
  },
  {
    name: 'aliAppCode',
    data: {
      appCode: 'code'
    }
  },
  {
    name: 'alipay',
    data: {
      transfer: {
        app_id: 'appid',
        url: 'https://openapi.alipaydev.com/gateway.do'
      },
      receipt: {
        url: 'https://mapi.alipay.com/gateway.do?',
        seller_id: 'id',
        seller_email: 'email',
        key: 'key'
      },
      notifyUrl: 'url'
    }
  },
  {
    name: 'socket',
    data: {
      serverClient: false,
      transports: ['polling', 'websocket'],
      pingInterval: 30000
    }
  },
  {
    name: 'transferKCB',
    data: {
      operatorId: []
    }
  }
];
