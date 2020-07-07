const path = require('path');
const defaultPath = path.resolve('public/default');
const staticPath = path.resolve('public/statics');
const siteSpecificPath = path.resolve(staticPath, '/site');
const attachIconPath = path.resolve(staticPath, './file_cover');
const normalWatermark = path.resolve(defaultPath, './watermark_normal.png');
const smallWatermark = path.resolve(defaultPath, './watermark_small.png')
const fontTtf = path.resolve(defaultPath, './simsun.ttc');
const fontNotoSansHansMedium = path.resolve(defaultPath, './NotoSansHans-Medium.otf');
// const fontTtf = fontNotoSansHansMedium;
const banner = path.resolve(siteSpecificPath, './ad_default.jpg');
const defaultPfBannerPath = defaultPath + '/default_pf_banner.jpg';
const defaultPfAvatarPath = defaultPath + '/default_pf_avatar.jpg';
const defaultAvatarPath = defaultPath + '/default_user_avatar.jpg';
const defaultAvatarSmallPath = defaultPath + '/default_user_avatar.jpg';
const defaultShopLogoPath = defaultPath + '/default_shopLogo.jpg';
const defaultThumbnailPath = defaultPath + '/default_thumb_image.jpg';
const defaultMediumPath = defaultPath + '/default_medium_image.jpg';
const defaultOriginPath = defaultPath + '/default_origin_image.jpg';
const defaultAdPath = siteSpecificPath + '/ad_default.jpg';
const defaultImageResourcePath = defaultPath + '/default_resource_image.jpg';
const defaultUserBannerPath = defaultPath + '/default_user_banner.jpg';
const defaultMessageFilePath = defaultPath + '/default_resource_image.jpg';
const defaultMessageVideoFramePath = defaultPath + '/default_message_video_frame.jpg';
const defaultVideoCoverPath = defaultPath + '/videoCover.jpg';
const defaultPostCoverPath = defaultPath + "/default_resource_image.jpg";
const defaultForumBannerPath = defaultPath + "/forum_banner.jpg";
const defaultColumnAvatarPath = defaultPath + "/column_avatar.jpg";
const defaultColumnBannerPath = defaultPath + "/column_banner.jpg";
const defaultPosterPath = defaultPath + "/default_poster.jpg";
const defaultRoleIconPath = staticPath + '/role_icon';
const defaultHomeBigLogo = siteSpecificPath + '/kclogo_misaka1.png';
const deletedPhotoPath = defaultPath + '/deleted_photo.jpg';
const disabledPhotoPath = defaultPath + '/disabled_photo.jpg';
// 默认表情图
const defaultStickerImage = defaultPath + '/default_avatar.gif';
const defaultScoreIconPath = defaultPath + '/kcb.png';
module.exports = {
  deletedPhotoPath,
  disabledPhotoPath,
  defaultScoreIconPath,
  siteSpecificPath,
  defaultRoleIconPath,
  watermark: normalWatermark,
  normalWatermark,
  smallWatermark,
  banner,
  fontTtf,
  fontNotoSansHansMedium,
  defaultPfBannerPath,
  defaultPfAvatarPath,
  defaultAvatarPath,
  defaultAvatarSmallPath,
  defaultShopLogoPath,
  defaultThumbnailPath,
  defaultMediumPath,
  defaultOriginPath,
	defaultUserBannerPath,
  defaultPath,
  attachIconPath,
  defaultPostCoverPath,
  defaultAdPath,
  defaultImageResourcePath,
  defaultMessageVideoFramePath,
  defaultMessageFilePath,
  defaultForumBannerPath,
  defaultVideoCoverPath,
  defaultColumnAvatarPath,
  defaultColumnBannerPath,
  defaultPosterPath,
  defaultHomeBigLogo,
  defaultStickerImage
};
