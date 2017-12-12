const moment = require('moment');
const path = require('path');
const {mkdirSync} = require('fs');

const uploadDir = path.resolve('tmp');
const uploadPath = path.resolve('resources/upload');
const pfBannerPath = path.resolve('resources/pf_banners');
const defaultPath = path.resolve('resources/default_things');
const defaultPfBannerPath = defaultPath + '/default_pf_banner.jpg';
const pfAvatarPath = path.resolve('resources/pf_avatars');
const defaultPfAvatarPath = defaultPath + '/default_pf_avatar.jpg';
const avatarPath = path.resolve('resources/newavatar');
const defaultAvatarPath = defaultPath + '/default_avatar.gif';
const avatarSmallPath = path.resolve('resources/newavatar_small');
const defaultAvatarSmallPath = defaultPath + '/default_avatar_small.gif';
const thumbnailPath = path.resolve('resources/thumbnails');
const defaultThumbnailPath = path.resolve('resources/default_tings/default_thumbnail.png');
const adPath = path.resolve('resources/ad_posts');
const siteSpecificPath = path.resolve('resources/site_specific');
const defaultAdPath = siteSpecificPath + '/ad_default.jpg';
const qrCodePath = path.resolve('resources/qr');

function generateFolderName(basePath) {
  const year = moment().format('/YYYY/');
  const full = moment().format('/YYYY/MM/');

  try {
    mkdirSync(basePath + year);
  } catch(e) {
    if(e.code !== 'EEXIST')
      throw e
  }
  try {
    mkdirSync(basePath + full);
  } catch(e) {
    if(e.code !== 'EEXIST')
      throw e
  }
  return full;
}

module.exports = {
  generateFolderName,
  koaBodySetting: {
    multipart: true,
    formidable: {
      maxFields: 20,
      uploadDir,
      hash: 'md5',
      keepExtensions: true
    }
  },
  sizeLimit: {
    largeImage: 1024 * 512,
    attachment: {
      height: 16384,
      width: 1920
    },
    banner: {
      width: 1050,
      height: 260
    }
  },
  uploadPath,
  pfBannerPath,
  defaultPfBannerPath,
  pfAvatarPath,
  defaultPfAvatarPath,
  avatarPath,
  defaultAvatarPath,
  avatarSmallPath,
  defaultAvatarSmallPath,
  thumbnailPath,
  defaultThumbnailPath,
  adPath,
  defaultPath,
  siteSpecificPath,
  defaultAdPath,
  qrCodePath,
  avatarSize: 192,
  avatarSmallSize: 48
};