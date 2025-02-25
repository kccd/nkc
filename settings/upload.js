const path = require('path');
const fs = require('fs');
const { mkdirSync } = fs;
const paths = {
  uploadDir: 'tmp',
  resourcesPath: 'resources',
  shopLogoPath: 'resources/shopLogo',
  siteSpecificPath: 'resources/site_specific',
  photoPath: 'resources/photo',
  photoSmallPath: 'resources/photo_small',
  appPath: 'resources/app',
  androidSavePath: 'resources/app/android',
  iosSavePath: 'resources/app/ios',
  friendImagePath: 'resources/friend_image',
  posterPath: 'resources/poster',
  questionImagePath: 'resources/question_image',
  shopCertsPath: 'resources/shop_certs',
  toolsPath: 'resources/tools',
  watermark: 'resources/watermark',
  watermarkCache: 'resources/watermarkCache',
  logoPath: 'resources/logo',
};
for (const item in paths) {
  const dirPath = path.resolve(__dirname, `../${paths[item]}`);
  fs.mkdirSync(dirPath, { recursive: true });
}
const pathsObj = {};
for (const key in paths) {
  if (!paths.hasOwnProperty(key)) {
    continue;
  }
  pathsObj[key] = path.resolve(__dirname, '../' + paths[key]);
}

function extGetPath(ext) {
  var originPath = 'tmp/temporary.';
  return path.resolve(originPath + ext);
}

function initFolders() {
  for (const key in pathsObj) {
    const realPath = pathsObj[key];
    try {
      fs.accessSync(realPath);
    } catch (err) {
      console.error(`creating folder '${realPath}'`);
      fs.mkdirSync(realPath);
    }
  }
}

function generateFolderName(basePath) {
  const moment = require('moment');
  const year = moment().format('/YYYY/');
  const full = moment().format('/YYYY/MM/');

  try {
    mkdirSync(basePath);
  } catch (e) {
    if (e.code !== 'EEXIST') {
      throw e;
    }
  }

  try {
    mkdirSync(basePath + year);
  } catch (e) {
    if (e.code !== 'EEXIST') {
      throw e;
    }
  }

  try {
    mkdirSync(basePath + full);
  } catch (e) {
    if (e.code !== 'EEXIST') {
      throw e;
    }
  }
  return full;
}

const uploadSettings = {
  generateFolderName,
  initFolders,
  extGetPath,
  koaBodySetting: {
    multipart: true,
    formidable: {
      maxFields: 20,
      maxFileSize: 4 * 1024 * 1024 * 1024,
      uploadDir: pathsObj.uploadDir,
      hash: 'md5',
      keepExtensions: true,
    },
  },
  sizeLimit: {
    largeImage: 1024 * 1024,
    attachment: {
      height: 16384,
      width: 1920,
    },
    banner: {
      width: 1050,
      height: 260,
    },
    photo: 20 * 1024 * 1024, // 证件照上传不能超过20M
    photoSmall: {
      width: 350,
      height: 230,
    },
    fundBanner: {
      width: 1370,
      height: 189,
    },
    fundBannerSmall: {
      width: 320,
      height: 144,
    },
    cover: {
      width: 640,
      height: 480,
    },
    lifePhoto: {
      width: 1920,
    },
    messageImageSM: {
      width: 300,
      height: 200,
    },
  },
  count: {
    lifePhoto: 1000, //生活照最多1000张
  },
  avatarSize: 192,
  forumAvatarSize: 96,
  avatarSmallSize: 48,
  lifePhotoCount: 16,
  certPhotoCount: 12,
  webLogoSize: 250,
  webSmallLogoSize: 50,
  userBannerSize: {
    height: 400,
    width: 800,
  },
};

module.exports = Object.assign(uploadSettings, pathsObj);
