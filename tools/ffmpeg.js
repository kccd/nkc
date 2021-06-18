const {spawn, exec} = require('child_process');
const settings = require('../settings');
const {banner, watermark, fontTtf} = settings.statics;
const {avatarSize, sizeLimit, avatarSmallSize, forumAvatarSize, webLogoSize, webSmallLogoSize, userBannerSize} = settings.upload;
const {promisify} = require('util');
const {platform} = require('os');
const fs = require('fs');
const {stat, unlink} = fs;
const path = require('path');
const PATH = require('path');
const __projectRoot = path.resolve(__dirname, `../`);
const {upload} = require('../settings');
const videoSettings = require('../settings/video');
const ff = require("fluent-ffmpeg");

const fontFilePath = settings.statics.fontNotoSansHansMedium;
const fontFilePathForFFmpeg = fontFilePath.replace(/\\/g, "/").replace(":", "\\:");
const tempImageForFFmpeg = settings.statics.deletedPhotoPath;

// ffmpeg 码率和帧率控制命令行参数 默认值
const bitrateAndFPSControlParameter = [
  '-c:v', 'libx264',                                            /* 指定编码器 */
  '-r', '24',                                                   /* 帧率 */
  '-maxrate', '5M',                                             /* 最大码率 */
  '-minrate', '1M',                                             /* 最小码率 */
  '-b:v', '1.16M',                                              /* 平均码率 */
];



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
  return spawnProcess('ffmpeg', ['-i', inputPath, '-movflags', 'faststart', '-y', ...bitrateAndFPSControlParameter, outputPath]);
}

// AVI格式视频转avi
const videoAviTransAvi = async(inputPath, outputPath) => {
  return spawnProcess('ffmpeg', ['-i', inputPath ,'-y', ...bitrateAndFPSControlParameter, outputPath])
}

// MP4转码为H264
const videoMP4TransH264 = async (inputPath, outputPath) => {
  return spawnProcess('ffmpeg', ['-i', inputPath, '-vcodec', 'libx264', '-movflags', 'faststart', '-y', ...bitrateAndFPSControlParameter, outputPath]);
}
// MP4转码为H264
// const videoMP4TransH264 = async (inputPath, outputPath) => {
//   return spawnProcess('ffmpeg', ['-i', inputPath, '-vcodec', 'libx264', '-acodec', 'copy', '-movflags', 'faststart', '-y', outputPath]);
// }

// MOV转码为MP4
const videoMOVTransMP4 = async (inputPath, outputPath) => {
  return spawnProcess('ffmpeg', ['-i', inputPath, '-vcodec', 'libx264', '-movflags', 'faststart', '-y', ...bitrateAndFPSControlParameter, outputPath])
}

// AVI转码为MP4
const videoAVITransMP4 = async (inputPath, outputPath) => {
  return spawnProcess('ffmpeg', ['-i', inputPath, '-movflags', 'faststart', '-y', ...bitrateAndFPSControlParameter, outputPath])
}
// webm转码为mp4
const videoWEBMTransMP4 = async (inputPath, outputPath) => {
  return spawnProcess('ffmpeg', ['-i', inputPath, '-movflags', 'faststart', '-y', ...bitrateAndFPSControlParameter, outputPath])
}

// AMR转码为MP3
const audioAMRTransMP3 = async (inputPath, outputPath) => {
  return spawnProcess('ffmpeg', ['-i', inputPath, ...bitrateAndFPSControlParameter, outputPath])
}

const audioAACTransMP3 = async (inputPath, outputPath) => {
  return spawnProcess('ffmpeg', ['-i', inputPath, ...bitrateAndFPSControlParameter, outputPath])
}

// WAV转码为MP3
const audioWAVTransMP3 = async (inputPath, outputPath) => {
  return spawnProcess('ffmpeg', ['-i', inputPath, ...bitrateAndFPSControlParameter, outputPath])
}

// WMA转码为MP3
const audioWMATransMP3 = async (inputPath, outputPath) => {
  return spawnProcess('ffmpeg', ['-i', inputPath, ...bitrateAndFPSControlParameter, outputPath])
}

const audioFLACTransMP3 = async (inputPath, outputPath) => {
  return spawnProcess('ffmpeg', ['-i', inputPath, ...bitrateAndFPSControlParameter, outputPath]);
}

const audioTransMP3 = async (inputPath, outputPath, ext) => {
  let func = async (inputPath, outputPath) => {
    return spawnProcess('ffmpeg', ['-i', inputPath, ...bitrateAndFPSControlParameter, outputPath]);
  }
  if(ext === 'amr') {
    func = audioAMRTransMP3;
  } else if(ext === 'aac') {
    func = audioAACTransMP3;
  } else if(ext === 'wav') {
    func = audioWAVTransMP3;
  } else if(ext === 'wma') {
    func = audioWMATransMP3;
  } else if(ext === 'flac') {
    func = audioFLACTransMP3;
  }
  return func(inputPath, outputPath);
};

const videoTransMP4 = async (inputPath, outputPath, ext) => {
  let func;
  if(ext === '3gp') {
    func = video3GPTransMP4;
  } else if(ext === 'mp4') {
    func = videoMP4TransH264;
  } else if(ext === 'mov') {
    func = videoMOVTransMP4;
  } else if(ext === 'avi') {
    func = videoAVITransMP4;
  } else if(ext === 'webm') {
    func = videoWEBMTransMP4;
  } else {
    func = videoMP4TransH264;
  }
  return func(inputPath, outputPath);
}
/**
 * 获取视频的帧宽高
 * @param {string} inputPath 视频路径
 */
const getVideoSize = async (inputPath) => {
  return spawnProcess('ffprobe', ["-v", "error", "-show_entries", "stream=width,height", "-of", "csv=p=0:s=x", inputPath])
    .then(data => {
      data = data.trim();
      let info = data.split("x");
      return {
        width: parseInt(info[0]),
        height: parseInt(info[1])
      }
    })
}

/**
 * 获取ffmpeg滤镜绘制出的文本的高宽
 */
async function getDrawTextSize(text, fontsize) {
  return new Promise((resolve, reject) => {
    exec(`ffmpeg -i ${tempImageForFFmpeg} -vf "drawtext=fontfile='${fontFilePathForFFmpeg}':fontsize=${fontsize}:text='${text}':x=0+0*print(tw):y=0+0*print(th)" -vframes 1 -f null -`,
    function(err, stdout, stderr ) {
      let results = stderr.trim().split("\n").reverse();
      resolve({
        width: parseFloat(results[8]),
        height: parseFloat(results[9])
      });
    });
  });
}

/**
 * 获取视频的比特率(Bps)
 * @param {string} inputPath 视频路径
 */
async function getVideoBitrate(inputPath) {
  return new Promise((resolve, reject) => {
    exec(`ffprobe -v error -of json -show_format ${inputPath}`,
    function(err, stdout, stderr) {
      let info = JSON.parse(stdout.trim());
      resolve(parseInt(info.format.bit_rate));
    })
  });
}

/**
 * 获取图片的尺寸
 * @param {string} inputPath 视频路径
 */
const getImageSize = async (inputPath) => {
  return spawnProcess('ffmpeg', ['-i', inputPath])
    .catch(data => {
      let results = data.match(/[0-9]+x[0-9]+/)[0].split("x");
      return Promise.resolve({
        width: parseInt(results[0]),
        height: parseInt(results[1])
      });
    })
}

/**
 * ffmpeg滤镜处理
 * @param {string} inputPath 输入文件路径
 * @param {string} outputPath 输出路径
 * @param {array} filters 滤镜指令（数组，一层滤镜一个元素）
 * @param {array} additionOptions 传给ffmpeg的额外参数
 */
const ffmpegFilter = async (inputPath, outputPath, filters, additionOptions = bitrateAndFPSControlParameter) => {
  return spawnProcess('ffmpeg',
    [
      ...['-i', inputPath],                                              /* 输入 */
      ...['-filter_complex', filters.join(";")],                         /* 滤镜表达式 */
      '-y',                                                              /* 覆盖输出 */
      ...additionOptions,                                                /* 额外参数 */
      outputPath                                                         /* 输出 */
    ]);
}

/**
 * ffmpeg图片滤镜处理
 * @param {string} inputPath 输入文件路径
 * @param {array} filters 滤镜指令（数组，一层滤镜一个元素）
 */
const ffmpegImageFilter = async (inputPath, outputPath, filters) => {
  return spawnProcess('ffmpeg',
    [
      ...['-i', inputPath],                                              /* 输入 */
      ...['-filter_complex', filters.join(";")],                         /* 滤镜表达式 */
      '-y',                                                              /* 覆盖输出 */
      outputPath                                                         /* 输出 */
    ]);
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
    flex = 0.1,
    transparency = 0.5,
    additionOptions = bitrateAndFPSControlParameter /* 码率和帧率控制参数 */
  } = op;
  const {width: videoWidth, height: videoHeight} = await getVideoSize(videoPath);
  let width = (videoWidth > videoHeight? videoHeight: videoWidth) * flex;
  return spawnProcess('ffmpeg', [
    '-i', videoPath, '-i', imagePath, '-filter_complex', `[1:v]scale=${width}:${width}/a, lut=a=val*${transparency}[logo];[0:v][logo]overlay=${position.x}:${position.y}`, '-y',
    ...additionOptions,                                  /* 额外参数 */
    output]);
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
    flex = 0.08,
    position = {x: 10, y: 10},
    transparency = 0.5
  } = op;
  const {height: videoHeight, width: videoWidth} = await getVideoSize(input);
  const logoSize = await getImageSize(image);
  let padHeight = ~~((videoHeight > videoWidth? videoWidth: videoHeight) * flex);
  let logoHeight = padHeight;
  let logoWidth = ~~(logoSize.width * (logoHeight / logoSize.height));
  const fontSize = padHeight - 10;
  const {height: textHeight, width: textWidth} = await getDrawTextSize(text, fontSize);
  const gap = ~~(logoWidth * 0.1); /* logo和文字之间和间隔 */
  let padWidth = logoWidth + textWidth + gap;

  image = image.replace(/\\/g, "/").replace(":", "\\:");

  return ffmpegFilter(input, output, [
    `movie='${image}'[logo]`,
    `[logo]scale=${logoWidth}:${logoHeight}[image]`,
    `[image]pad=${padWidth}:${padHeight + 1}:0:0:white@0, drawtext=x=${logoWidth + gap}:y=${logoHeight-textHeight}/2:text='${text}':fontsize=${fontSize}:fontcolor=white:fontfile='${fontFilePathForFFmpeg}:shadowcolor=black:shadowx=1:shadowy=1', lut=a=val*${transparency}[watermask]`,
    `[0:v][watermask]overlay=${position.x}:${position.y}`
  ])
}


/**
 * 图片添加图文水印
 * @param {object} op 配置
 * 配置项：
 *  input 输入路径， output 输出路径， image 图片路径， text 文字, flex 水印占整个图片高度的百度比, position 水印位置
 */
async function addImageTextWaterMaskForImage(op) {
  let {
    input,
    output,
    image,
    text,
    flex = 0.08,
    position = {x: 10, y: 10},
    transparency = 0.5,
    additionOptions
  } = op;
  const {height: imageHeight, width: imageWidth} = await getImageSize(input);
  const logoSize = await getImageSize(image);
  let padHeight = ~~((imageHeight > imageWidth? imageWidth: imageHeight) * flex);
  let logoHeight = padHeight - 1;
  let logoWidth = ~~(logoSize.width * (logoHeight / logoSize.height)) - 1;
  const fontSize = padHeight - 10;
  const {height: textHeight, width: textWidth} = await getDrawTextSize(text, fontSize);
  const gap = ~~(logoWidth * 0.1); /* logo和文字之间和间隔 */
  let padWidth = logoWidth + textWidth + gap;

  image = image.replace(/\\/g, "/").replace(":", "\\:");

  return ffmpegImageFilter(input, output, [
    `movie='${image}'[logo]`,
    `[logo]scale=${logoWidth}:${logoHeight}[image]`,
    `[image]pad=${padWidth}:${padHeight}:0:0:white@0, drawtext=x=${logoWidth + gap}:y=${logoHeight-textHeight}/2:text='${text}':fontsize=${fontSize}:fontcolor=fcfcfc:fontfile='${fontFilePathForFFmpeg}:shadowcolor=b1b1b1:shadowx=1:shadowy=1', lut=a=val*${transparency}[watermask]`,
    `[0:v][watermask]overlay=${position.x}:${position.y}`
  ], additionOptions)
}

/*
* 生成指定分辨率的视频
* @param {String} inputFile 原视频磁盘路径
* @param {String} outputFile 生成视频的磁盘路径
* @param {Object} props
*   @param {Number} height 目标视频高
*   @param {Number} fps
*   @param {Number} bitrate 单位Kbps
* @author pengxiguaa 2021-01-22
* */
async function createOtherSizeVideo(inputFile, outputFile, props) {
  const {height, bitrate, fps} = props;
  return new Promise((resolve, reject) => {
    ff(inputFile)
      .fps(fps)
      .size(`?x${height}`)
      .videoBitrate(bitrate + 'k')
      .output(outputFile)
      .on('end', resolve)
      .on('error', reject)
      .run()
  });
}
/*
* 获取视频信息
* @param {String} inputFilePath 视频路径
* @return {Object}
*   @param {Object} format
*     @param {}
* */
async function getVideoInfo(inputFilePath) {
  return new Promise((resolve, reject) => {
    ff.ffprobe(inputFilePath, (err, metadata) => {
      if(err) return reject(err);
      const {streams} = metadata;
      const videoInfo = streams.filter(stream => stream["codec_type"] === "video").shift();
      if(!videoInfo) {
        return reject(new Error("cannot get video stream detail"));
      }
      const {
        width, height, r_frame_rate, duration, bit_rate, display_aspect_ratio
      } = videoInfo;
      const arr = r_frame_rate.split('/');
      resolve({
        width,
        height,
        duration,
        bitRate: bit_rate,
        displayAspectRatio: display_aspect_ratio,
        fps: Number((arr[0] / arr[1]).toFixed(1))
      });
    });
  })
}

async function getAudioDuration(filePath) {
  return new Promise((resolve, reject) => {
    ff.ffprobe(filePath, (err, metadata) => {
      if(err) return reject(err);
      const {streams} = metadata;
      const audioInfo = streams.filter(stream => stream['codec_type'] === 'audio').shift();
      if(!audioInfo) {
        return reject(new Error('Cannot get audio stream detail'));
      }
      const {
        duration
      } = audioInfo;
      resolve({
        duration
      });
    })
  });
}


/**
 * 视频打水印
 */
async function addWaterMask(options) {
  let {
    videoPath,
    imageStream,
    output,
    position = {x: 10, y: 10},
    flex = 0.4,
    bitRate,
    scalaByHeight
  } = options;
  const { width, height } = await getVideoInfo(videoPath);
  return await new Promise((resolve, reject) => {
    const imageWidth = Math.min(width, height) * flex;
    ff(videoPath)
      .input(imageStream)
      .complexFilter([
        `[1:v]scale=${imageWidth}:-2[logo]`,
        `[0:v][logo]overlay=${position.x}:${position.y}[o]`,
        `[o]scale=-2:${scalaByHeight}`
      ])
      .videoBitrate(bitRate)
      .output(output)
      .on("end", resolve)
      .on("error", reject)
      .run();
  });
}

module.exports = {
  getVideoInfo,
  createOtherSizeVideo,
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
  videoWEBMTransMP4,
  videoTransMP4,
  audioAMRTransMP3,
  audioFLACTransMP3,
  audioWAVTransMP3,
  audioWMATransMP3,
  audioTransMP3,
  getVideoSize,
  getImageSize,
  getDrawTextSize,
  getVideoBitrate,
  ffmpegFilter,
  addImageWaterMask,
  addImageTextWaterMask,
  addImageTextWaterMaskForImage,
  addWaterMask,
  getAudioDuration
};
