const {spawn, exec} = require('child_process');
const settings = require('../settings');
const {avatarSize, sizeLimit, avatarSmallSize, forumAvatarSize, webLogoSize, webSmallLogoSize} = settings.upload;
const {banner, watermark} = settings.statics;
const {promisify} = require('util');
const {platform} = require('os');
const fs = require('fs');
const {stat, unlink} = fs;
const path = require('path');
const __projectRoot = path.resolve(__dirname, `../`);
const execProcess = promisify(exec);
const {upload} = require('../settings');
const spawnProcess = (pathName, args, options = {}) => {
  return new Promise((resolve, reject) => {
    const bat = spawn(pathName, args, options);
    let data = '';
    let err = '';
    bat.stdout.on('data', (d) => {
      data += `${d}\n`;
    });
    bat.stderr.on('data', (e) => {
      err += `${e}\n`;
    });
    bat.on('close', (code) => {
      if(code !== 0) {
        reject(err);
      }
      resolve(data);
    });
    bat.on('error', (e) => {
      reject(e);
    })
  })
};

const os = platform();
const linux = (os === 'linux');

const attachify = path => {
  const {width, height} = sizeLimit.attachment;
  if(linux) {
    return spawnProcess('convert', [path, '-gravity', 'southeast', '-resize', `${width}x${height}>`, watermark, '-compose', 'dissolve', '-define', 'compose:args=50', '-composite', '-quality', '90', path]);
  }
  return spawnProcess('magick', ['convert', path, '-gravity', 'southeast', '-resize', `${width}x${height}>`, watermark, '-compose', 'dissolve', '-define', 'compose:args=50', '-composite', '-quality', '90', path]);
};


const watermarkify = path => {
  if(linux) {
    return spawnProcess('composite', ['-dissolve', '50', '-gravity', 'southeast ', watermark, path, path]);
  }
  return spawnProcess('magick', ['composite', '-dissolve', '50', '-gravity', 'southeast ', watermark, path, path]);
};

// 手机图片上传自动旋转
const allInfo = async path => {
  let back;
  back = await spawnProcess('magick', ['identify','-format','%[orientation]', path])
  if(back.trim() === "RightTop"){
    return spawnProcess('magick', ['convert', path, '-rotate', '90', path]);
  }
  if(back.trim() === "LeftBottom"){
    return spawnProcess('magick', ['convert', path, '-rotate', '270', path]);
  }
  if(back.trim() === "BottomRight"){
    return spawnProcess('magick', ['convert', path, '-rotate', '180', path]);
  }
}

const info = async path => {
  let back;
  if(linux) {
    back = await spawnProcess('identify', ['-format', '%wx%h', path]);
  } else {
    back = await spawnProcess('magick', ['identify', '-format', '%wx%h', path]);
  }
  back = back.replace('\n', '');
  const sizeInfo = back.split('x');
  const [width, height] = sizeInfo;
  return {width, height}
};

const thumbnailify = (path, dest) => {
  if(linux) {
    return spawnProcess('convert', [path, '-thumbnail', '64x64', '-strip', '-background', 'wheat', '-alpha', 'remove', dest]);
  }
  return spawnProcess('magick', ['convert', path, '-thumbnail', '64x64', '-strip', '-background', 'wheat', '-alpha', 'remove', dest]);
};

const generateAdPost = async (path, name) => {
  let stats;
  try {
    stats = await promisify(stat)(path)
  } catch(e) {
    stats = null
  }
  let url;
  if(stats) {
    url = path;
  } else {
    url = banner;
  }
  if(linux) {
    await spawnProcess('convert', [url, '-resize', '640', name]);
    let size = await spawnProcess('identify', ['-format', '%G', name]);
    size = size.replace('\n', '');
    const arr = size.split('x');
    const height = arr[1];
    await spawnProcess('convert',[name, '-crop', `640x360+0+${Math.round(height/2 - 180)}`, name]);
    await spawnProcess('convert', [name, '-resize', '640x360', name]);
  } else {
    await spawnProcess('magick', ['convert', url, '-resize', '640', name]);
    let size = await spawnProcess('magick', ['identify', '-format', '%G', name]);
    size = size.replace('\n', '');
    const arr = size.split('x');
    const height = arr[1];
    await spawnProcess('magick',['convert', name, '-crop', `640x360+0+${Math.round(height/2 - 180)}`, name]);
    await spawnProcess('magick', ['convert', name, '-resize', '640x360', name]);
  }
};

const bannerify = path => {
  const {banner} = sizeLimit;
  if(linux) {
    return spawnProcess('convert', [
      path, '-resize', `${banner.width}x${banner.height}^`, '-gravity', 'Center', '-quality', '90', '-crop', `${banner.width}x${banner.height}+0+0`, path]);
  }
  return spawnProcess('magick', ['convert', path, '-resize', `${banner.width}x${banner.height}^`, '-gravity', 'Center', '-quality', '90', '-crop', `${banner.width}x${banner.height}+0+0`, path]);
};

const avatarify = (options) => {
	const {top, left, width, height, path, targetPath} = options;
	if(linux) {
		return spawnProcess('convert', [path, '-strip', '-thumbnail', `${width}x${height}^`, '-crop', `${avatarSize}x${avatarSize}+${left}+${top}`, targetPath]);
	}
	return spawnProcess('magick', ['convert', path, '-strip', '-thumbnail', `${width}x${height}^`, '-crop', `${avatarSize}x${avatarSize}+${left}+${top}`, targetPath]);
};


const avatarSmallify = (path, dest) => {
  if(linux) {
    return spawnProcess('convert', [path, '-thumbnail', `${avatarSmallSize}x${avatarSmallSize}`, '-strip', '-background', 'wheat', '-alpha', 'remove', dest]);
  }
  return spawnProcess('magick', ['convert', path, '-thumbnail', `${avatarSmallSize}x${avatarSmallSize}`, '-strip', '-background', 'wheat', '-alpha', 'remove', dest]);
};

const npmInstallify = () => {
  return spawnProcess('npm', ['install'], {
    cwd: __projectRoot
  });
};

const gitify = () => {
  return spawnProcess('git', ['pull'], {
    cwd: __projectRoot
  });
};

const photoify = (filePath, targetPath) => {
  if(linux) {
    return spawnProcess('convert', [filePath, targetPath]);
  }
  return spawnProcess('magick', ['convert', filePath, targetPath]);
};

const photoSmallify = (filePath, targetPath) => {
	const {height, width} = sizeLimit.photoSmall;
	if(linux) {
		return spawnProcess('convert', [filePath, '-resize', `${width}x${height}`, '-gravity', 'center', '-extent', `${width}x${height}`, targetPath])
	}
	return spawnProcess('magick', ['convert', filePath, '-resize', `${width}x${height}`, '-gravity', 'center', '-extent', `${width}x${height}`, targetPath])
};

const fundBannerify = (filePath, targetPath) => {
	const {height, width} = sizeLimit.fundBanner;
	if(linux) {
		return spawnProcess('convert', [filePath, '-resize', `${width}x${height}^`, '-gravity', 'Center', '-quality', '90', '-crop', `${width}x${height}+0+0`, targetPath])
	}
	return spawnProcess('magick', ['convert', filePath, '-resize', `${width}x${height}^`, '-gravity', 'Center', '-quality', '90', '-crop', `${width}x${height}+0+0`, targetPath])
};

const fundLogoify = (filePath, targetPath) => {
	const {height, width} = sizeLimit.fundBannerSmall;
	if(linux) {
		return spawnProcess('convert', [filePath, '-resize', `${width}x${height}^`, '-gravity', 'Center', '-quality', '90', '-crop', `${width}x${height}+0+0`, targetPath])
	}
	return spawnProcess('magick', ['convert', filePath, '-resize', `${width}x${height}^`, '-gravity', 'Center', '-quality', '90', '-crop', `${width}x${height}+0+0`, targetPath])
};

const removeFile = async path => {
  return promisify(unlink)(path);
};

const coverify = (path, output) => {
  const {width, height} = sizeLimit.cover;
  if(linux) {
    return spawnProcess('convert', [
      path, '-resize', `${width}x${height}^`, '-gravity', 'Center', '-quality', '90', '-crop', `${width}x${height}+0+0`, output]);
  }
  return spawnProcess('magick', ['convert', path, '-resize', `${width}x${height}^`, '-gravity', 'Center', '-quality', '90', '-crop', `${width}x${height}+0+0`, output]);
};

const lifePhotoify = async path => {
	const {width} = sizeLimit.lifePhoto;
	if(linux) {
		return spawnProcess('convert', [
			path, '-resize', `${width}x`, path]);
	}
	return spawnProcess('magick', ['convert', path, '-resize', `${width}x`, path]);
};


const forumAvatarify = async (options) => {
	const {top, left, width, height, path, targetPath} = options;
	if(linux) {
		return spawnProcess('convert', [path, '-strip', '-thumbnail', `${width}x${height}^`, '-crop', `${forumAvatarSize}x${forumAvatarSize}+${left}+${top}`, targetPath]);
	}
	return spawnProcess('magick', ['convert', path, '-strip', '-thumbnail', `${width}x${height}^`, '-crop', `${forumAvatarSize}x${forumAvatarSize}+${left}+${top}`, targetPath]);
};

const webLogoify = async (options) => {
	const {top, left, width, height, path, targetPath} = options;
	if(linux) {
		return spawnProcess('convert', [path, '-strip', '-thumbnail', `${width}x${height}^`, '-crop', `${webLogoSize}x${webLogoSize}+${left}+${top}`, targetPath]);
	}
	return spawnProcess('magick', ['convert', path, '-strip', '-thumbnail', `${width}x${height}^`, '-crop', `${webLogoSize}x${webLogoSize}+${left}+${top}`, targetPath]);
};
const webSmallLogoify = async (path, targetPath) => {
	if(linux) {
		return spawnProcess('convert', [path, '-resize', `${webSmallLogoSize}x${webSmallLogoSize}^`, targetPath]);
	}
	return spawnProcess('magick', ['convert', path, '-resize', `${webSmallLogoSize}x${webSmallLogoSize}^`, targetPath]);
};

module.exports = {
  avatarify,
  attachify,
  watermarkify,
  info,
  allInfo,
  thumbnailify,
  generateAdPost,
  avatarSmallify,
  bannerify,
  npmInstallify,
  gitify,
	webLogoify,
	webSmallLogoify,
  coverify,
  photoify,
	photoSmallify,
	fundBannerify,
	fundLogoify,
  removeFile,
	lifePhotoify,
	forumAvatarify
};


