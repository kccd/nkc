const moment = require('moment');
const path = require('path');
const {mkdirSync} = require('fs');

const uploadDir = path.resolve('tmp');
const uploadPath = path.resolve('resources/upload');
const pfBannerPath = path.resolve('resources/pf_banners');
const pfAvatarPath = path.resolve('resources/pf_avatars');
const avatarPath = path.resolve('resources/newavatar');
const avatarSmallPath = path.resolve('resources/newavatar_small');
const thumbnailPath = path.resolve('resources/thumbnails');
const adPath = path.resolve('resources/ad_posts');
const siteSpecificPath = path.resolve('resources/site_specific');
const qrCodePath = path.resolve('resources/qr');
const idPhotoPath = path.resolve('resources/idPhotos');

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
  pfAvatarPath,
  avatarPath,
  avatarSmallPath,
  thumbnailPath,
  adPath,
  idPhotoPath,
  siteSpecificPath,
  qrCodePath,
  avatarSize: 192,
  avatarSmallSize: 48
};