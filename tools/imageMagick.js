const {exec} = require('child_process');
const settings = require('../settings');
const {avatarSize, sizeLimit} = settings.upload;
const {banner, watermark} = settings.statics;
const {promisify} = require('util');
const {platform} = require('os');
const fs = require('fs');
const {stat} = fs;

const execute = promisify(exec);
const os = platform();
let convert = 'imagemagick convert',
  identify = 'imagemagick identify',
  composite = 'imagemagick composite';
if(os === 'linux') {
  convert = 'convert';
  identify = 'identify';
  composite = 'composite'
}

const avatarify = async path => await execute(
  `${convert} ${path} -strip -thumbnail ${avatarSize}x${avatarSize}^> 
  -gravity Center -qulity 90 -crop ${avatarSize}x${avatarSize}+0+0 ${path}`
);

const attachify = async path => {
  const {width, height} = sizeLimit.attachment;
  await execute(
    `${command} ${path} -gravity southeast -resize ${width}x${height}> 
    ${watermark} -compose dissoleve -define compose:args=50 -composite -quality 90 ${path}`
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

const bannerify = path => execute(`
  ${convert} ${path} -resize ${sizeLimit.banner}^ -gravity Center -quality 90 -crop ${sizeLimit.banner}+0+0 ${path}
`);


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
  bannerify,
  removeFile
};


