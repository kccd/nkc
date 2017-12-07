const {exec} = require('child_process');
const settings = require('../settings');
const {avatarSize, sizeLimit, avatarSmallSize} = settings.upload;
const {banner, watermark} = settings.statics;
const {promisify} = require('util');
const {platform} = require('os');
const fs = require('fs');
const {stat} = fs;

const execute = promisify(exec);
const os = platform();
let convert = 'magick convert',
  identify = 'magick identify',
  composite = 'magick composite';
if(os === 'linux') {
  convert = 'convert';
  identify = 'identify';
  composite = 'composite'
}

const attachify = async path => {
  const {width, height} = sizeLimit.attachment;
  return execute(
    `${convert} ${path} -gravity southeast -resize ${width}x${height} ${path}`
  )
};


const watermarkify = async path => await execute(
  `${composite} -dissolve 50 -gravity southeast ${watermark} ${path} ${path}`
);

const info = async path => {
  const back = await execute(
    `${identify} -format %wx%h ${path}`
  );
  const {stdout} = back;
  const sizeInfo = stdout.match(/^(.*)x(.*)$/);
  const [width, height] = sizeInfo;
  return {width, height}
};

const thumbnailify = async (path, dest) => await execute(
  `${convert} ${path} -thumbnail 64x64 -strip -background wheat -alpha remove ${dest}`
);

const generateAdPost = async (path, name) => {
  let stats;
  try {
    stats = await promisify(stat)(path)
  } catch(e) {
    stats = null
  }
  if(stats) {
    await execute(
      `${convert} ${path} -resize 640 ${name}`
    );
  } else {
    await execute(
      `${convert} ${banner} -resize 640 ${name}`
    )
  }
  const size = await execute(`${identify} -format %G ${name}`)
  const arr = size.stdout.split('x');
  const height = arr[1];
  await execute(`
    ${convert} ${name} -crop 640x360+0+${Math.round(height/2 - 180)} ${name}
  `);
  await execute(`
    ${convert} ${name} -resize 640x360 ${name}
  `)
};

const bannerify = path => {
  const {banner} = sizeLimit;
  console.log(banner);
  return execute(
    `${convert} ${path} -resize ${banner.width} -gravity Center -quality 90 -crop ${banner.width}x${banner.height}+0+0 ${path}`);
};

const avatarify = path => execute(
  `${convert} ${path} -strip -thumbnail x${1000} -gravity Center -crop ${1000}x${1000}+0+0 -strip -thumbnail ${1000} -gravity Center -quality 90 -crop ${1000}x${1000}+0+0 -strip -thumbnail ${avatarSize}x${avatarSize} ${path}`);

const avatarSmallIfy = (path, dest) => execute(
  `${convert} ${path} -thumbnail ${avatarSmallSize}x${avatarSmallSize} -strip -background wheat -alpha remove ${dest}`
);

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


