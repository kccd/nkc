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
      enabled: true,
      transparency: 88,
      normalAttachId: '',
      smallAttachId: '',
      minHeight: 479,
      minWidth: 799,
      buyNoWatermark: 2000     // 购买去水印功能所需积分，默认2积分
    },
    videoVBRControl: {
      configs: [
        {
          type: "width",
          from: 0,
          to: 1280,
          bv: 0.6
        },
        {
          type: "width",
          from: 1280,
          to: 1920,
          bv: 1.16
        }
      ],
      defaultBV: 1.16
    }
  }
};
