const path = require('path');
const fs = require('fs');
const {mkdirSync} = fs;


const paths = {
  configDir: 'config',
  keyDir: 'key',
  uploadDir: 'tmp',
  resourcesPath: 'resources',
  uploadPath: 'resources/upload',
  mediaPath: 'resources/media',
  coverPath: 'resources/cover',
  pfBannerPath: 'resources/pf_banners',
  pfAvatarPath: 'resources/pf_avatars',
  avatarPath: 'resources/newavatar',
  avatarSmallPath: 'resources/newavatar_small',
  thumbnailPath: 'resources/thumbnails',
  adPath: 'resources/ad_posts',
  siteSpecificPath: 'resources/site_specific',
  qrCodePath: 'resources/qr',
  photoPath: 'resources/photo',
  photoSmallPath: 'resources/photo_small',
  fundBannerPath: 'resources/fundBanner',
  fundLogoPath: 'resources/fundLogo',
  webLogoPath: 'resources/logo',
  userBannerPath: 'resources/user_banners',
  messageFilePath: 'resources/message',
  messageImageSMPath: 'resources/message/sm',
  messageVoiceBrowser: 'resources/message/vb',
  frameImgPath: 'resources/frameImage',
  appPath: 'resources/app',
  androidSavePath: 'resources/app/android',
  iosSavePath: 'resources/app/ios',
  friendImagePath: 'resources/friend_image',
  posterPath: 'resources/poster',
  questionImagePath: 'resources/question_image'
};

const pathsObj = {};
for(const key in paths) {
  if(!paths.hasOwnProperty(key)) continue;
  pathsObj[key] = path.resolve(paths[key]);
}

function initFolders() {
  for(const key in pathsObj) {
    const realPath = pathsObj[key];
    try {
      fs.accessSync(realPath);
    } catch (err) {
      console.error(`creating folder '${realPath}'`);
      fs.mkdirSync(realPath);
    }
  }
}

/*const uploadDir = path.resolve('tmp');
const uploadPath = path.resolve('resources/upload');
const coverPath = path.join(__dirname, '../resources/cover');
const pfBannerPath = path.resolve('resources/pf_banners');
const pfAvatarPath = path.resolve('resources/pf_avatars');
const avatarPath = path.resolve('resources/newavatar');
const avatarSmallPath = path.resolve('resources/newavatar_small');
const posterPath = path.resolve('resources/poster');
const posterSmallPath = path.resolve('resources/poster_small');
const thumbnailPath = path.resolve('resources/thumbnails');
const adPath = path.resolve('resources/ad_posts');
const siteSpecificPath = path.resolve('resources/site_specific');
const qrCodePath = path.resolve('resources/qr');
const photoPath = path.resolve('resources/photo');
const photoSmallPath = path.resolve('resources/photo_small');
const fundBannerPath = path.resolve('resources/fundBanner');
const fundLogoPath = path.resolve('resources/fundLogo');
const webLogoPath = path.resolve('resources/logo');
const userBannerPath = path.resolve('resources/user_banners');
const messageFilePath = path.resolve('resources/message');
const messageImageSMPath = path.resolve('resources/message/sm');
const frameImgPath = path.resolve('resources/frameImage');
const androidSavePath = path.resolve('resources/app/android');
const iosSavePath = path.resolve('resources/app/ios');
const friendImagePath = path.resolve('resource/friend_image');*/

function generateFolderName(basePath) {
  const moment = require('moment');
  const year = moment().format('/YYYY/');
  const full = moment().format('/YYYY/MM/');

  try {
    mkdirSync(basePath);
  } catch(e) {
    if(e.code !== 'EEXIST')
      throw e
  }

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

const uploadSettings = {
  generateFolderName,
  initFolders,
  koaBodySetting: {
    multipart: true,
    formidable: {
      maxFields: 20,
	    maxFileSize: 200*1024*1024,
      uploadDir: pathsObj.uploadDir,
      hash: 'md5',
      keepExtensions: true
    }
  },
  sizeLimit: {
    largeImage: 1024 * 1024,
    attachment: {
      height: 16384,
      width: 1920
    },
    banner: {
      width: 1050,
      height: 260
    },
	  photo: 20*1024*1024, // 证件照上传不能超过20M
	  photoSmall: {
    	width: 350,
		  height: 230
	  },
	  fundBanner: {
    	width: 1370,
		  height: 189
	  },
	  fundBannerSmall: {
    	width: 320,
		  height: 144
	  },
    cover: {
      width: 640,
      height: 480
    },
	  lifePhoto: {
    	width: 1920
	  },
    messageImageSM: {
      width: 300,
      height: 200
    }
  },
	count: {
  	lifePhoto: 1000 //生活照最多1000张
	},
  /*coverPath,
  uploadPath,
  pfBannerPath,
  pfAvatarPath,
  avatarPath,
  avatarSmallPath,
  posterPath,
  posterSmallPath,
  thumbnailPath,
  adPath,
  photoPath,
  siteSpecificPath,
  qrCodePath,
	photoSmallPath,
	fundBannerPath,
  messageFilePath,
	fundLogoPath,
	webLogoPath,
	userBannerPath,
  messageImageSMPath,
  frameImgPath,
  iosSavePath,
  androidSavePath,*/
  avatarSize: 192,
	forumAvatarSize: 96,
  avatarSmallSize: 48,
	lifePhotoCount: 16,
	certPhotoCount: 12,
	webLogoSize: 250,
	webSmallLogoSize: 50,
	userBannerSize: {
  	height: 400,
		width: 800
	}
};

module.exports = Object.assign(uploadSettings, pathsObj);
