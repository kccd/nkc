const moment = require('moment');
const path = require('path');
const {mkdirSync} = require('fs');

const uploadDir = path.resolve('tmp');
const uploadPath = path.resolve('resources/upload');
const pfBannerPath = path.resolve('resources/pf_banners');
const pfAvatarPath = path.resolve('resources/pf_avatars');
const avatarPath = path.resolve('resources/avatars');

function generateFolderName() {
  const name = moment().format('/YYYY/MM/');
  const dir = uploadPath + name;
  try {
    mkdirSync(dir);
  } catch(e) {
    if(e.code !== 'EEXIST')
      throw e
  }
  return name;
}

module.exports = {
  generateFolderName,
  koaBodySetting: {
    multipart: true,
    formidable: {
      maxFields: 20,
      uploadDir,
      hash: 'md5'
    }
  },
  sizeLimit: {
    largeImage: 1024 * 512,
    attachment: {
      height: 16384,
      width: 1920
    },
    banner: '1050x260'
  },
  uploadPath,
  pfBannerPath,
  pfAvatarPath,
  avatarPath,
  avatarSize: 192,
};