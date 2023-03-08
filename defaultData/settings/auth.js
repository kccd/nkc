const {settingIds} = require('../../settings/serverSettings');
module.exports = {
  _id: settingIds.auth,
  c: {
    auditorId: [],
    auditorCerts: [],
    auth1Content:'绑定手机号即可完成身份认证',
    auth2Content:'上传身份证正反照片完成认证',
    auth3Content: '请拍摄手持身份证视频并在视频中清晰朗读数组 {code}',
    verifyPhoneNumber: {
      enabled: true,
      interval: 4320, // 检测时间 小时
      type: 'reviewPost', // reviewPost, disablePublish
      reviewPostContent: "请参与定期验证手机号，验证前你所发表的内容需通过审核后才能显示。",
      disablePublishContent: "请参与定期验证手机号，验证前你无权发表内容。",
    }
  }
};