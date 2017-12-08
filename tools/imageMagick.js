const {spawn} = require('child_process');
const settings = require('../settings');
const {avatarSize, sizeLimit, avatarSmallSize} = settings.upload;
const {banner, watermark} = settings.statics;
const {promisify} = require('util');
const {platform} = require('os');
const fs = require('fs');
const {stat} = fs;

// const spawnProcess = promisify(spawn);

const spawnProcess = (pathName, args, options = {}) => {
  return new Promise((resolve, reject) => {
    const bat = spawn(pathName, args, options);
    let data = '';
    let err = '';
    bat.stdout.on('data', (d) => {
      data = d.toString();
    });
    bat.stderr.on('data', (e) => {
      err = e.toString();
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

/*const os = platform();
let convert = 'magick convert',
  identify = 'magick identify',
  composite = 'magick composite';
if(os === 'linux') {
  convert = 'convert';
  identify = 'identify';
  composite = 'composite'
}*/

const attachify = async path => {
  const {width, height} = sizeLimit.attachment;
  return spawnProcess('magick', ['convert', path, '-gravity', 'southeast', '-resize', `${width}x${height}>`, path]);
};


const watermarkify = async path => await spawnProcess('magick', ['composite', '-dissolve', '50', '-gravity', 'southeast ', watermark, path, path]);

const info = async path => {
  const back = await spawnProcess('magick', ['identify', '-format', '%wx%h', path]);
  const sizeInfo = back.match(/^(.*)x(.*)$/);
  const [width, height] = sizeInfo;
  return {width, height}
};

const thumbnailify = async (path, dest) => await spawnProcess('magick', ['convert', path, '-thumbnail', '64x64', '-strip', '-background', 'wheat', '-alpha', 'remove', dest]);

const generateAdPost = async (path, name) => {
  let stats;
  try {
    stats = await promisify(stat)(path)
  } catch(e) {
    stats = null
  }
  if(stats) {
    await spawnProcess('magick', ['convert', path, '-resize', '640', name]);
  } else {
    await spawnProcess('magick', ['convert', banner, '-resize', '640', name]);
  }
  const size = await spawnProcess('magick', ['identify', '-format', '%G', name]);
  const arr = size.stdout.split('x');
  const height = arr[1];
  await spawnProcess('magick',['convert', name, '-crop', `640x360+0+${Math.round(height/2 - 180)}`, name]);
  await spawnProcess('magick', ['convert', name, '-resize', '640x360', name]);
};

const bannerify = path => {
  const {banner} = sizeLimit;
  return spawnProcess('magick', ['convert', path, '-resize', `${banner.width}x${banner.height}^`, '-gravity', 'Center', '-quality', '90', '-crop', `${banner.width}x${banner.height}+0+0`, path]);
};

const avatarify = path => spawnProcess('magick', ['convert', path, '-strip', '-thumbnail', `${avatarSize}x${avatarSize}^`, '-gravity', 'Center', '-crop', `${avatarSize}x${avatarSize}+0+0`, path]);

const avatarSmallIfy = (path, dest) => spawnProcess('magick', ['convert', path, '-thumbnail', `${avatarSmallSize}x${avatarSmallSize}`, '-strip', '-background', 'wheat', '-alpha', 'remove', dest]);

const removeFile = async path => {
  return fs.unlinkSync(path);
};


module.exports = {
  avatarify,
  attachify,
  watermarkify,
  info,
  thumbnailify,
  generateAdPost,
  avatarSmallIfy,
  bannerify,
  removeFile
};


