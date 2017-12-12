const {spawn, exec} = require('child_process');
const settings = require('../settings');
const {avatarSize, sizeLimit, avatarSmallSize} = settings.upload;
const {banner, watermark} = settings.statics;
const {promisify} = require('util');
const {platform} = require('os');
const fs = require('fs');
const {stat, unlink} = fs;
const path = require('path');
const __projectRoot = path.resolve(__dirname, `../`);
const execProcess = promisify(exec);
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
    return spawnProcess('convert', [path, '-gravity', 'southeast', '-resize', `${width}x${height}>`, path]);
  }
  return spawnProcess('magick', ['convert', path, '-gravity', 'southeast', '-resize', `${width}x${height}>`, path]);
};


const watermarkify = path => {
  if(linux) {
    return spawnProcess('composite', ['-dissolve', '50', '-gravity', 'southeast ', watermark, path, path]);
  }
  return spawnProcess('magick', ['composite', '-dissolve', '50', '-gravity', 'southeast ', watermark, path, path]);
};

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

const avatarify = path => {
  if(linux) {
    return spawnProcess('convert', [path, '-strip', '-thumbnail', `${avatarSize}x${avatarSize}^`, '-gravity', 'Center', '-crop', `${avatarSize}x${avatarSize}+0+0`, path]);
  }
  return spawnProcess('magick', ['convert', path, '-strip', '-thumbnail', `${avatarSize}x${avatarSize}^`, '-gravity', 'Center', '-crop', `${avatarSize}x${avatarSize}+0+0`, path]);
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

const removeFile = async path => {
  return promisify(unlink)(path);
};


module.exports = {
  avatarify,
  attachify,
  watermarkify,
  info,
  thumbnailify,
  generateAdPost,
  avatarSmallify,
  bannerify,
  npmInstallify,
  gitify,
  removeFile
};


