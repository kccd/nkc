const {spawn, exec} = require('child_process');
const settings = require('../settings');
const {banner, watermark, fontTtf} = settings.statics;
const {avatarSize, sizeLimit, avatarSmallSize, forumAvatarSize, webLogoSize, webSmallLogoSize, userBannerSize} = settings.upload;
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

const www = "1920";
const hhh = "480";

const os = platform();
const linux = (os === 'linux');

// 图片缩小
const imageNarrow = path => {
  return spawnProcess('magick', ['convert', path, '-resize', `${www}>`,path])
}

const attachify = path => {
  const {width, height} = sizeLimit.attachment;
  if(linux) {
    return spawnProcess('convert', [path, '-gravity', 'southeast', '-resize', `${width}x${height}>`, watermark, '-compose', 'dissolve', '-define', 'compose:args=50', '-composite', '-quality', '90', path]);
  }
  return spawnProcess('magick', ['convert', path, '-gravity', 'southeast', '-resize', `${width}x${height}>`, watermark, '-compose', 'dissolve', '-define', 'compose:args=50', '-composite', '-quality', '90', path]);
};


const watermarkify = (trans, position, bigWater,path) => {
  if(linux) {
    return spawnProcess('composite', ['-dissolve', trans, '-gravity', position, bigWater, path, path]);
  }
  return spawnProcess('magick', ['composite', '-dissolve', trans, '-gravity', position, '-geometry', '+10+10', bigWater, path, path]);
};

// sitelogo 水印
const watermarkifyLogo = (dpi, position, waterSmallPath, path) => {
  if(linux) {
    return spawnProcess('composite', ['-dissolve', '50', '-gravity', position, waterSmallPath, path, path]);
  }
  return spawnProcess('magick', ['composite', '-dissolve', '100', '-gravity', position  ,'-geometry', dpi, waterSmallPath, path, path]);
};

// username 水印 
const watermarkifyFont = (dpi, font, position, path) =>{
  if(linux) {
    return spawnProcess('mogrify', ['mogrify','-font', fontTtf, '-pointsize', '24', '-fill', 'white', '-weight', 'bolder','-gravity', position ,'-annotate', '+10+10', font ,path, path]);
  }
  // return spawnProcess('magick', ['mogrify','-font', fontTtf, '-pointsize', '24', '-fill', 'white', '-weight', 'bolder','-gravity', 'center ' ,'-draw', "text 0,25 'hello'" ,path, path]);
  return spawnProcess('magick', ['mogrify','-font', fontTtf, '-pointsize', '24', '-fill', '#FFFFFF', '-weight', 'bolder','-stroke','#FFFFFF','-gravity', position ,'-annotate', dpi, font ,path, path]);
}

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

// 获取水印图片尺寸
const waterInfo = async path => {
  let back;
  if(linux) {
    back = await spawnProcess('identify', ['-format', '%wx%h', path]);
  } else {
    back = await spawnProcess('magick', ['identify', '-format', '%wx%h', path]);
  }
  back = back.replace('\n', '');
  const sizeInfo = back.split('x');
  const [siteLogoWidth, siteLogoHeigth] = sizeInfo;
  return {siteLogoWidth, siteLogoHeigth}
};

const thumbnailify = (path, dest) => {
  if(linux) {
    return spawnProcess('convert', [path, '-thumbnail', '150x150', '-strip', '-background', 'wheat', '-alpha', 'remove', dest]);
  }
  return spawnProcess('magick', ['convert', path, '-thumbnail', '150x150', '-strip', '-background', 'wheat', '-alpha', 'remove', dest]);
};

const shopLogoify = (path, dest) => {
  if(linux) {
    return spawnProcess('convert', [path, '-thumbnail', '100x100', '-strip', '-background', 'wheat', '-alpha', 'remove', dest]);
  }
  return spawnProcess('magick', ['convert', path, '-thumbnail', '100x100', '-strip', '-background', 'wheat', '-alpha', 'remove', dest]);
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
	const {top, left, width, height, path, targetPath, needCrop} = options;
	let arr;

	if(needCrop) {
		arr = [path, '-strip', '-thumbnail', `${width}x${height}^`, '-crop', `${avatarSize}x${avatarSize}+${left}+${top}`, targetPath];
	} else {
		arr = [path, '-strip', '-thumbnail', `${avatarSize}x${avatarSize}^`, '-crop', `${avatarSize}x${avatarSize}+0+0`, targetPath];
	}
	if(!linux) {
		arr.unshift('convert');
	}
	if(linux) {
		return spawnProcess('convert', arr);
	}
	return spawnProcess('magick', arr);
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

const userBannerify = (options) => {
	const {top, left, width, height, path, targetPath, needCrop} = options;
	let arr;

	if(needCrop) {
		arr = [path, '-strip', '-thumbnail', `${width}x${height}^`, '-crop', `${userBannerSize.width}x${userBannerSize.height}+${left}+${top}`, targetPath];
	} else {
		arr = [path, '-strip', '-thumbnail', `${userBannerSize.width}x${userBannerSize.height}^`, '-crop', `${userBannerSize.width}x${userBannerSize.height}+0+0`, targetPath];
	}
	if(!linux) {
		arr.unshift('convert');
	}
	if(linux) {
		return spawnProcess('convert', arr);
	}
	return spawnProcess('magick', arr);
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

const shopCertImageify = async (path, targetPath) => {
	if(linux) {
		return spawnProcess('convert', [path, targetPath]);
	}
	return spawnProcess('magick', ['convert', path, targetPath]);
};
const shopCertSmallImageify = async (path, targetPath) => {
  const width = 150, height = 150;
	if(linux) {
		return spawnProcess('convert', [path, '-resize', `${width}x${height}^`, '-gravity', 'Center', '-quality', '90', '-crop', `${width}x${height}+0+0`, targetPath]);
	}
	return spawnProcess('magick', ['convert', path, '-resize', `${width}x${height}^`, '-gravity', 'Center', '-quality', '90', '-crop', `${width}x${height}+0+0`, targetPath]);
};

const webLogoify = async (path, targetPath) => {
	if(linux) {
		return spawnProcess('convert', [path, targetPath]);
	}
	return spawnProcess('magick', ['convert', path, targetPath]);
};

const messageImageSMify = async (path, targetPath) => {
  const {width, height} = sizeLimit.messageImageSM;
  if(linux) {
    return spawnProcess('convert', [path, '-resize', `${width}x${height}^`, targetPath])
  }
  return spawnProcess('magick', ['convert', path, '-resize', `${width}x${height}^`, targetPath])
};

const friendImageify = async (path, targetPath) => {
  const width = 1080;
  const height = 1920;
  const imageWidth = (await info(path)).width;
  const imageHeight = (await info(path)).height;
  let arr;
  if(Number(imageWidth) > width || Number(imageHeight) > height) {
    arr = [path, '-resize', `${width}x${imageHeight}`, targetPath];
  } else {
    arr = [path, targetPath];
  }
  if(linux) {
    return spawnProcess('convert', arr);
  } else {
    arr.unshift('convert');
    return spawnProcess('magick', arr);
  }
};

const questionImageify = async (path, targetPath) => {
  const width = 500;
  const height = 250;
  const arr = [path, '-resize', `${width}x${height}`, '-quality', '80', targetPath];
  if(linux) {
    return spawnProcess('convert', arr);
  } else {
    arr.unshift('convert');
    return spawnProcess('magick', arr);
  }
};

// 获取视频的第一帧为图片
const firstFrameToImg = async (videoPath,imgPath) => {
  return spawnProcess('ffmpeg',['-i',videoPath,'-vframes' ,'1', imgPath])
}


// 视频转码为H264
const videoToH264 = async(inputPath, outputPath) => {
  return spawnProcess('ffmpeg', ['-i', inputPath, '-vcodec', 'libx264', '-acodec', 'copy', '-y' ,outputPath])
}

// 降低视频码率
const turnVideo = async(inputPath, outputPath) => {
  return spawnProcess('ffmpeg', ['-i', inputPath, '-vcodec', 'libx264', '-acodec', 'copy', '-b:v', '2000k', '-bufsize', '2000k', outputPath])
}
module.exports = {
  avatarify,
  attachify,
  watermarkify,
  watermarkifyLogo,
  watermarkifyFont,
  info,
  waterInfo,
  allInfo,
  thumbnailify,
  generateAdPost,
  avatarSmallify,
  bannerify,
  npmInstallify,
  gitify,
	webLogoify,
  coverify,
  photoify,
	photoSmallify,
	fundBannerify,
	fundLogoify,
  removeFile,
	lifePhotoify,
  forumAvatarify,
  imageNarrow,
	userBannerify,
  messageImageSMify,
  friendImageify,
  firstFrameToImg,
  videoToH264,
  turnVideo,
  questionImageify,
  shopLogoify,
  shopCertImageify,
  shopCertSmallImageify
};


