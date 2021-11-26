module.exports = {
  _id: "upload",
  c: {
    extensionLimit: {
      defaultBlacklist: ['exe', 'bat'],
      defaultWhitelist: [],
      using: 'blacklist',
      others: [
        {
          type: 'role-dev',
          using: 'blacklist',
          blacklist: [],
          whitelist: []
        }
      ]
    },
    countLimit: {
      default: 10,
      others: [
        {
          type: 'role-dev',
          count: 100,
        }
      ]
    },
    sizeLimit: {
      default: 10 * 1024,
      others: [
        {
          ext: 'mp4',
          size: 200 * 1024
        },
        {
          ext: 'gif',
          size: 5 * 1024
        }
      ]
    },
    watermark: {
      picture: {
        enabled: true,
        transparency: 88,
        minHeight: 479,
        minWidth: 799,
        flex: 0.08,
      },
      video: {
        enabled: true,
        transparency: 88,
        minHeight: 479,
        minWidth: 799,
        flex: 0.2,
      },
      buyNoWatermark: 2000     // 购买去水印功能所需积分，默认2积分
    },
    videoVBRControl : {
      configs : [ 
          {
            from : 0,
            to : 921600,
            bv : 0.6
          }, 
          {
            from : 921600,
            to : 2073600,
            bv : 1.16
          }
      ],
      defaultBV : 1.16
    }
  }
};
