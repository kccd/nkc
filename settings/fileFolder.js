module.exports = {

  // AttachmentModel

  // 用户头像
  userAvatar: 'attachment/avatar',
  // 用户背景
  userBanner: 'attachment/avatar',
  // 专栏头像
  columnAvatar: 'attachment/avatar',
  // 专栏背景
  columnBanner: 'attachment/avatar',
  // 专业LOGO
  forumLogo: 'attachment/avatar',
  // 专业背景
  forumBanner: 'attachment/avatar',
  // 基金头像
  fundAvatar: 'attachment/avatar',
  // 基金背景
  fundBanner: 'attachment/avatar',
  // 水印     废弃
  watermark: 'attachment/website',
  // 首页logo
  homeBigLogo: 'attachment/website',
  // 网站图标  废弃
  siteIcon: 'attachment/website',
  // 积分图标
  scoreIcon: 'attachment/website',
  // 文章封面
  postCover: 'attachment/cover',
  // 首页推荐文章的封面（轮播图、固定图）
  recommendThreadCover: 'attachment/cover',
  // 上报问题 图片
  problemImage: 'attachment/problem',



  // VerifiedUploadModel

  // 用户实名身份认证上传的身份证、视频
  verifiedUpload: 'identity/authenticate', // 旧 废弃
  // 身份证 A面
  identityPictureA: 'identity/authenticate',
  // 身份证 B面
  identityPictureB: 'identity/authenticate',
  // 手持身份证视频
  identityVideo: 'identity/authenticate',



  // MessageFileModel

  // 聊天中的视频文件
  messageVideo: 'message/video',
  // 聊天中的图片文件
  messageImage: 'message/image',
  // 聊天中的语音文件
  messageVoice: 'message/voice',
  // 聊天中的附件
  messageFile: 'message/file',
  // 聊天中的音频文件
  messageAudio: 'message/audio',


  // ResourceModel

  // 上传附件 图片
  mediaPicture: 'resource/picture',
  // 上传附件 图片原图
  mediaOrigin: 'resource/origin',
  // 上传附件 视频
  mediaVideo: 'resource/video',
  // 上传附件 音频
  mediaAudio: 'resource/audio',
  // 上传附件 附件
  mediaAttachment: 'resource/attachment',
};
