const {randomBytes} = require('crypto');
module.exports = [
  {
    name: 'cookie',
    data: {
      secret: randomBytes(128).toString('hex').toString(),
      experimentalSecret: randomBytes(128).toString('hex').toString(),
      maxAge: 604800000
    }
  },
  {
    name: 'attachment',
    data: [
      /*{
        path: path.resolve(__dirname, '../resources'), // 资源目录
        startingTime: '1999-01-01', // 开始时间
        endTime: '2099-01-01', // 结束时间
      }*/
    ]
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
  },
  {
    name: 'PDFPreview',
    maxGetPageScale: 0.5,     // 生成预览版PDF文件时，在原pdf中最大取占比多少的页数
    maxGetPageCount: 8        // 生成预览版PDF文件时，在原pdf中最大取多少页
  }
];
