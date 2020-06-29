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


// 获取视频的第一帧图片
const videoFirstThumbTaker = async (videoPath,imgPath) => {
  return spawnProcess('ffmpeg',['-i',videoPath, '-ss', '1', '-vframes' ,'1', imgPath])
}

// 视频转码为H264
const videoTranscode= async(inputPath, outputPath) => {
  return spawnProcess('ffmpeg', ['-i', inputPath, '-vcodec', 'libx264', '-acodec', 'copy','-movflags', 'faststart', '-y' ,outputPath]);
}

// 降低视频码率
const videoReduceRate = async(inputPath, outputPath) => {
  return spawnProcess('ffmpeg', ['-i', inputPath, '-vcodec', 'libx264', '-acodec', 'copy', '-b:v', '2000k', '-bufsize', '2000k', outputPath]);
}

// 将元数据移动到视频的第一帧
const videoMoveMetaToFirstThumb = async (inputPath, outputPath) => {
  return spawnProcess('ffmpeg', ['-i', inputPath, '-movflags', 'faststart', '-y', outputPath]);
}

// 调整视频的像素与画面比例
const videoSetPixelAndscale = async (inputPath, outputPath) => {
  return spawnProcess('ffmpeg', ['-i', inputPath, '-vf', 'scale=640:480', outputPath, '-hide_banner']);
}

// 3GP转为MP4
const video3GPTransMP4 = async (inputPath, outputPath) => {
  return spawnProcess('ffmpeg', ['-i', inputPath, '-movflags', 'faststart', '-y', outputPath]);
}

// AVI格式视频转avi
const videoAviTransAvi = async(inputPath, outputPath) => {
  return spawnProcess('ffmpeg', ['-i', inputPath ,'-y',outputPath])
}

// MP4转码为H264
const videoMP4TransH264 = async (inputPath, outputPath) => {
  return spawnProcess('ffmpeg', ['-i', inputPath, '-vcodec', 'libx264', '-movflags', 'faststart', '-y', outputPath]);
}
// MP4转码为H264
// const videoMP4TransH264 = async (inputPath, outputPath) => {
//   return spawnProcess('ffmpeg', ['-i', inputPath, '-vcodec', 'libx264', '-acodec', 'copy', '-movflags', 'faststart', '-y', outputPath]);
// }

// MOV转码为MP4
const videoMOVTransMP4 = async (inputPath, outputPath) => {
  return spawnProcess('ffmpeg', ['-i', inputPath, '-vcodec', 'libx264', '-movflags', 'faststart', '-y', outputPath])
}

// AVI转码为MP4
const videoAVITransMP4 = async (inputPath, outputPath) => {
  return spawnProcess('ffmpeg', ['-i', inputPath, '-movflags', 'faststart', '-y', outputPath])
}

// AMR转码为MP3
const audioAMRTransMP3 = async (inputPath, outputPath) => {
  return spawnProcess('ffmpeg', ['-i', inputPath, outputPath])
}

const audioAACTransMP3 = async (inputPath, outputPath) => {
  return spawnProcess('ffmpeg', ['-i', inputPath, outputPath])
}

// WAV转码为MP3
const audioWAVTransMP3 = async (inputPath, outputPath) => {
  return spawnProcess('ffmpeg', ['-i', inputPath, outputPath])
}

// WMA转码为MP3
const audioWMATransMP3 = async (inputPath, outputPath) => {
  return spawnProcess('ffmpeg', ['-i', inputPath, outputPath])
}

/**
 * 视频加水印
 * @param {Object} options 配置
 * videoPath 视频路径, imagePath 水印路径, output 输出位置, position 水印位置, scale 水印大小, alpha 水印透明度 
 */
const addWaterMask = async (op) => {
  op.position = op.position || {x: 10, y: 10};
  op.scale = op.scale || {width: 40, height: 40};
  op.alpha = op.alpha || 400;
  return spawnProcess('ffmpeg', ['-i', op.videoPath, '-i', op.imagePath, '-filter_complex', `[1:v]scale=${op.scale.width}:${op.scale.height}[scale];[scale]geq=a='${op.alpha}':lum='lum(X,Y)':cb='cb(X,Y)':cr='cr(X,Y)'[trans];[0:v][trans]overlay=${op.position.x}:${op.position.y}`, op.output]);
}

/**
 * 获取视频的帧宽高
 * @param {string} inputPath 视频路径
 */
const getVideoSize = async (inputPath) => {
  return spawnProcess('ffmpeg', ['-i', inputPath])
    .catch(data => {
      let results = data.match(/Video: (.*?), (.*?), (.*?)[,\s]/)[3].split("x");
      return Promise.resolve({
        width: parseInt(results[0]),
        height: parseInt(results[1])
      });
    })
}

/**
 * 获取ffmpeg滤镜绘制出的文本的高宽
 */
async function getDrawTextSize(text, fontsize) {
  return new Promise((resolve, reject) => {
    exec(`ffmpeg -i C:/Users/Chris/Pictures/input.mp4 -vf "drawtext=fontfile='C\\:/Users/Chris/Pictures/simsun.ttc':fontsize=${fontsize}:text='${text}':x=0+0*print(tw):y=0+0*print(th)" -vframes 1 -f null -`, 
    function(err, stdout, stderr ) {
      let results = stderr.split("\n").reverse();
      resolve({
        width: parseFloat(results[3]),
        height: parseFloat(results[4])
      });
    });
  });
}

/**
 * 获取图片的尺寸
 * @param {string} inputPath 视频路径
 */
const getImageSize = async (inputPath) => {
  return spawnProcess('ffmpeg', ['-i', inputPath])
    .catch(data => {
      let results = data.match(/Video: (.*?), (.*?), (.*?)[,\s]/)[3].split("x");
      return Promise.resolve({
        width: parseInt(results[0]),
        height: parseInt(results[1])
      });
    })
}

/**
 * 添加水印到左上角
 * @param {object} op 配置
 */
const addWaterMasktoNorthwest = async (op) => {
  return addWaterMask({...op, position: {x: 12, y: 12}});
}

/**
 * 添加水印到右上角
 * @param {object} op 配置
 */
const addWaterMasktoNortheast = async (op) => {
  return addWaterMask({...op, position: {x: "W-w-12", y: 12}});
}

/**
 * 添加水印到右下角
 * @param {object} op 配置
 */
const addWaterMasktoSoutheast = async (op) => {
  return addWaterMask({...op, position: {x: "W-w-12", y: "H-h-12"}});
}

/**
 * 添加水印到左下角
 * @param {object} op 配置
 */
const addWaterMasktoSouthwest = async (op) => {
  return addWaterMask({...op, position: {x: 12, y: "H-h-12"}});
}

/**
 * 添加水印到正中间
 * @param {object} op 配置
 */
const addWaterMasktoCenter = async (op) => {
  return addWaterMask({...op, position: {x: "(W-w)/2", y: "(H-h)/2"}});
}

/**
 * ffmpeg滤镜处理
 * @param {string} inputPath 输入文件路径
 * @param {array} filters 滤镜指令（数组，一层滤镜一个元素）
 */
const ffmpegFilter = async (inputPath, outputPath, filters) => {
  return spawnProcess('ffmpeg', ['-i', inputPath, '-filter_complex', filters.join(";"), '-y', outputPath]);
}

/**
 * 添加图文水印到左上角
 * @param {object} op 配置
 * 配置项：
 *  input 输入路径， output 输出路径， image 图片路径， text 文字
 */
async function addImageTextWaterMasktoNorthwest(op) {
  let fontSize = 40;
  let imageSize = 60;
  let textSize = await getDrawTextSize(op.text, fontSize);
  return ffmpegFilter(op.input, op.output, [
    `movie='${op.image}'[logo]`,
    `[logo]scale=${imageSize}:${imageSize}[image]`,
    `[image]pad=(${imageSize}+${textSize.width}):${imageSize}:0:0:black@0, drawtext=x=w-tw:y=10:text='${op.text}':fontsize=${fontSize}:fontcolor=white:shadowx=0:shadowy=0:shadowcolor=black:fontfile='C\\:/Users/Chris/Pictures/simsun.ttc'[watermask]`,
    "[0:v][watermask]overlay=10:10",
  ])
}


/**
 * 添加图文水印到右上角
 * @param {object} op 配置
 * 配置项：
 *  input 输入路径， output 输出路径， image 图片路径， text 文字
 */
async function addImageTextWaterMasktoNortheast(op) {
  let fontSize = 40;
  let imageSize = 60;
  let textSize = await getDrawTextSize(op.text, fontSize);
  return ffmpegFilter(op.input, op.output, [
    `movie='${op.image}'[logo]`,
    `[logo]scale=${imageSize}:${imageSize}[image]`,
    `[image]pad=(${imageSize}+${textSize.width}):${imageSize}:0:0:black@0, drawtext=x=w-tw:y=10:text='${op.text}':fontsize=${fontSize}:fontcolor=white:shadowx=0:shadowy=0:shadowcolor=black:fontfile='C\\:/Users/Chris/Pictures/simsun.ttc'[watermask]`,
    "[0:v][watermask]overlay=(W-w-10):10",
  ])
}


/**
 * 添加图文水印到右下角
 * @param {object} op 配置
 * 配置项：
 *  input 输入路径， output 输出路径， image 图片路径， text 文字
 */
async function addImageTextWaterMasktoSoutheast(op) {
  let fontSize = 40;
  let imageSize = 60;
  let textSize = await getDrawTextSize(op.text, fontSize);
  return ffmpegFilter(op.input, op.output, [
    `movie='${op.image}'[logo]`,
    `[logo]scale=${imageSize}:${imageSize}[image]`,
    `[image]pad=(${imageSize}+${textSize.width}):${imageSize}:0:0:black@0, drawtext=x=w-tw:y=10:text='${op.text}':fontsize=${fontSize}:fontcolor=white:shadowx=0:shadowy=0:shadowcolor=black:fontfile='C\\:/Users/Chris/Pictures/simsun.ttc'[watermask]`,
    "[0:v][watermask]overlay=(W-w-10):(H-h-10)",
  ])
}

/**
 * 添加图文水印到左下角
 * @param {object} op 配置
 * 配置项：
 *  input 输入路径， output 输出路径， image 图片路径， text 文字
 */
async function addImageTextWaterMasktoSouthwest(op) {
  let fontSize = 40;
  let imageSize = 60;
  let textSize = await getDrawTextSize(op.text, fontSize);
  return ffmpegFilter(op.input, op.output, [
    `movie='${op.image}'[logo]`,
    `[logo]scale=${imageSize}:${imageSize}[image]`,
    `[image]pad=(${imageSize}+${textSize.width}):${imageSize}:0:0:black@0, drawtext=x=w-tw:y=10:text='${op.text}':fontsize=${fontSize}:fontcolor=white:shadowx=0:shadowy=0:shadowcolor=black:fontfile='C\\:/Users/Chris/Pictures/simsun.ttc'[watermask]`,
    "[0:v][watermask]overlay=10:(H-h-10)",
  ])
}

/**
 * 添加图文水印到正中间
 * @param {object} op 配置
 * 配置项：
 *  input 输入路径， output 输出路径， image 图片路径， text 文字
 */
async function addImageTextWaterMasktoCenter(op) {
  let fontSize = 40;
  let imageSize = 60;
  let textSize = await getDrawTextSize(op.text, fontSize);
  return ffmpegFilter(op.input, op.output, [
    `movie='${op.image}'[logo]`,
    `[logo]scale=${imageSize}:${imageSize}[image]`,
    `[image]pad=(${imageSize}+${textSize.width}):${imageSize}:0:0:white@0, drawtext=x=w-tw:y=10:text='${op.text}':fontsize=${fontSize}:fontcolor=white:shadowx=0:shadowy=0:shadowcolor=black:fontfile='C\\:/Users/Chris/Pictures/simsun.ttc'[watermask]`,
    "[0:v][watermask]overlay=(W-w)/2:(H-h)/2",
  ])
}



/**
 * 视频加图片水印
 * @param {Object} options 配置
 * videoPath 视频路径, imagePath 水印路径, output 输出位置, position 水印位置, alpha 水印透明度, flex 水印占整个视频宽度的百度比
 */
const addImageWaterMask = async (op) => {
  let {
    videoPath,
    imagePath, 
    output, 
    position =  {x: 10, y: 10},
    flex = 0.06
  } = op;
  let videoSize = await getVideoSize(videoPath);
  let width = videoSize.width * flex;
  return spawnProcess('ffmpeg', ['-i', videoPath, '-i', imagePath, '-filter_complex', `[1:v]scale=${width}:${width}/a[logo];[0:v][logo]overlay=${position.x}:${position.y}`, output]);
}

/**
 * 视频添加图文水印
 * @param {object} op 配置
 * 配置项：
 *  input 输入路径， output 输出路径， image 图片路径， text 文字, flex 水印占整个视频高度的百度比, position 水印位置
 */
async function addImageTextWaterMask(op) {
  let {
    input,
    output,
    image,
    text,
    flex = 0.1,
    position = {x: 10, y: 10}
  } = op;
  const videoSize = await getVideoSize(input);
  const logoSize = await getImageSize(image);
  const textSize = await getDrawTextSize(text, videoSize.height * flex);

  let logoHeight = parseFloat((textSize.height * 1.4).toFixed(2));
  let logoWidth = parseFloat((logoSize.width * (logoHeight / logoSize.height)).toFixed(2));

  image = image.replace("\\", "/").replace(":", "\\:");
  return ffmpegFilter(input, output, [
    `movie='${image}'[logo]`,
    `[logo]scale=${logoWidth}:${logoHeight}[image]`,
    `[image]pad=(${logoWidth}+${textSize.width}):${logoHeight}:0:0:white@0, drawtext=x=w-tw:y=(h-th)/2:text='${text}':fontsize=${textSize.height}:fontcolor=white:shadowx=0:shadowy=0:shadowcolor=black:fontfile='C\\:/Users/Chris/Pictures/simsun.ttc'[watermask]`,
    `[0:v][watermask]overlay=${position.x}:${position.y}`
  ])
}


module.exports = {
  videoFirstThumbTaker,
  videoTranscode,
  videoAviTransAvi,
  audioAACTransMP3,
  videoReduceRate,
  videoMoveMetaToFirstThumb,
  videoSetPixelAndscale,
  video3GPTransMP4,
  videoMP4TransH264,
  videoMOVTransMP4,
  videoAVITransMP4,
  audioAMRTransMP3,
  audioWAVTransMP3,
  audioWMATransMP3,
  addWaterMask,
  getVideoSize,
  getImageSize,
  getDrawTextSize,
  addWaterMasktoNorthwest,
  addWaterMasktoNortheast,
  addWaterMasktoSoutheast,
  addWaterMasktoSouthwest,
  addWaterMasktoCenter,
  ffmpegFilter,
  addImageTextWaterMasktoNorthwest,
  addImageTextWaterMasktoNortheast,
  addImageTextWaterMasktoSoutheast,
  addImageTextWaterMasktoSouthwest,
  addImageTextWaterMasktoCenter,
  addImageWaterMask,
  addImageTextWaterMask
};
