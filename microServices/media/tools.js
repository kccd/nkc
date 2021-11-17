const fs = require("fs");
const fsPromises = fs.promises;
const Path = require('path');
const PATH = require("path");
const crypto = require("crypto");
const {spawn, exec} = require("child_process");
const FormData = require("form-data");
const axios = require("axios");

const {platform} = require("os");
const ff = require("fluent-ffmpeg");
const os = platform();
const linux = (os === 'linux');

/*
  获取文件的md5
  @param {String} path 文件路径
  @return {String} md5
  @author pengxiguaa 2019-10-31
*/
async function getFileMD5(filePath) {
  return new Promise((resolve, reject) => {
    fs.access(filePath, err => {
      try{
        if(err) return reject(err);
        const stream = fs.createReadStream(filePath);
        const hmac = crypto.createHash("md5");
        stream.on("data", (chunk) => {
          hmac.update(chunk);
        });
        stream.on("end", () => {
          resolve(hmac.digest("hex"));
        });
        stream.on("error", err => {
          reject(err);
        });
      } catch(err) {
        reject(err);
      }
    });
  });
}

/*
* 移动文件
* @param {String} path 源文件路径
* @param {String} targetPath 目标路径
* */
async function moveFile(path, targetPath) {
  const dirname = Path.dirname(targetPath);
  await fsPromises.mkdir(dirname, {recursive: true});
  await fsPromises.copyFile(path, targetPath);
  await deleteFile(path);
}

/*
* 获取图片的高宽
* */
const info = async path => {
  const args = ['identify', '-format', '%wx%h', path + `[0]`];
  let result;
  if(!linux) {
    result = await spawnProcess('magick', args);
  } else {
    result = await spawnProcess(args.shift(), args);
  }
  result = result.replace('\n', '');
  result = result.trim();
  const [width, height] = result.split('x');
  return {
    height: Number(height),
    width: Number(width)
  };
  // return imageSize(path);
};

// 手机图片上传自动旋转
// 或采用 -auto-orient 参数
const allInfo = async path => {

  if (linux) {
    await spawnProcess('convert', [path, '-strip', '-auto-orient', path]);
  } else {
    await spawnProcess('magick', ['convert', path, '-strip', '-auto-orient', path]);
  }
}



/*
* 删除文件
* @param {String} 文件路径
* */
async function deleteFile(filePath) {
  if(!await accessFile(filePath)) return;
  const stat = await fsPromises.stat(filePath);
  if(stat.isFile()) {
    await fsPromises.unlink(filePath);
  }
}

/*
* 获取文件大小
* @param {String} 文件路径
* */
async function getFileSize(filePath) {
  const stat = await fsPromises.stat(filePath);
  return stat.size;
}

/*
* 获取文件信息
* */
async function getFileInfo(filePath) {
  const name = PATH.basename(filePath);
  const ext = PATH.extname(filePath).replace('.', '');
  const hash = await getFileMD5(filePath);
  const stats = await fsPromises.stat(filePath);
  const size = stats.size;
  return {
    path: filePath,
    name,
    ext,
    stats,
    hash,
    size,
  };
}

/*
* 判断文件是否存在
* */
async function accessFile(targetPath) {
  try{
    await fsPromises.access(targetPath);
    return true;
  } catch(err) {
    return false;
  }
}


async function spawnProcess(pathName, args, options = {}) {
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
        reject(new Error(err));
      }
      resolve(data);
    });
    bat.on('error', (e) => {
      reject(e);
    })
  })
}


/*
* 推送文件到存储服务
* @param {String} url 存储服务的链接
* @param {[Object]} files 待推送的文件信息
*   @param {String} filePath 文件磁盘路径
*   @param {String} path 文件在存储服务上的目录
*   @param {Number} time 文件上传时间戳
* */
async function storeClient(url, files = []) {
  if(!Array.isArray(files)) {
    files = [files];
  }
  const formData = new FormData();
  const filesInfo = {};
  for(let i = 0; i < files.length; i++) {
    const {filePath, path, time} = files[i];
    const key = `file_${i}`;
    filesInfo[key] = {
      path,
      time
    };
    formData.append(key, fs.createReadStream(filePath));
  }
  formData.append('filesInfo', JSON.stringify(filesInfo));
  return new Promise((resolve, reject) => {
    axios({
      url,
      method: 'POST',
      maxBodyLength: Infinity,
      data: formData,
      headers: formData.getHeaders()
    })
      .then(resolve)
      .catch(reject);
  });
}

/*
* 获取图片宽高
* */
async function getPictureSize(pictureFilePath) {
  const args = ['identify', '-format', '%wx%h', pictureFilePath + `[0]`];
  let result;
  if(!linux) {
    result = await spawnProcess('magick', args);
  } else {
    result = await spawnProcess(args.shift(), args);
  }
  result = result.replace('\n', '');
  result = result.trim();
  const [width, height] = result.split('x');
  return {
    height: Number(height),
    width: Number(width)
  };
}

/*
* 替换文件名格式
* */
function replaceFileExtension(filename, newExtension) {
  if(!filename) throw new Error(`文件名不能为空`);
  if(!newExtension) throw new Error(`新的文件格式不能为空`);
  filename = filename.split('.');
  if(filename.length > 1) {
    filename.pop();
  }
  filename.push(newExtension);
  filename = filename.join('.');
  return filename;
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
        duration: Math.round(duration),
        bitRate: bit_rate,
        displayAspectRatio: display_aspect_ratio,
        fps: Number((arr[0] / arr[1]).toFixed(1))
      });
    });
  })
}

/*
* 获取音频信息
* @param {String} filePath 音频路径
* @return {Object}
*   @Param {Number} duration 音频时长 秒
* */
async function getAudioInfo(filePath) {
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
        duration: Math.round(duration)
      });
    })
  });
}

// 图片缩小
const imageNarrow = path => {
  return spawnProcess('magick', ['convert', path, '-resize', `1920>`,path])
}
//图片打大logo水印
const watermarkify = (trans, position, bigWater,path) => {
  if(linux) {
    return spawnProcess('composite', ['-dissolve', trans, '-gravity', position, bigWater, path, path]);
  }
  return spawnProcess('magick', ['composite', '-dissolve', trans, '-gravity', position, '-geometry', '+10+10', bigWater, path, path]);
};

/*
* 图片打水印
* */
async function addWaterMask(options) {
  let {
    videoPath,
    imageStream,
    output,
    position = {x: 10, y: 10},
    flex = 0.2,
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
      .outputOptions([
        '-map_metadata',
        '-1'
      ])
      .output(output)
      .on("end", resolve)
      .on("error", reject)
      .run();
  });
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
 * 图片添加图文水印
 * @param {object} op 配置
 * 配置项：
 *  input 输入路径， output 输出路径， image 图片路径， text 文字, flex 水印占整个图片高度的百分比, position 水印位置
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

/**
* 获取图片的尺寸
* @param {string} inputPath 视频路径
*/
const getImageSize = async (inputPath) => {
  return spawnProcess('ffmpeg', ['-i', inputPath])
    .catch(data => {
      console.log('data', data);
      let results = data.match(/[0-9]+x[0-9]+/)[0].split("x");
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

//保存缩略图
const thumbnailify = (path, dest) => {
  if(linux) {
    return spawnProcess('convert', [path, '-thumbnail', '150x150', '-strip', '-background', 'wheat', '-alpha', 'remove', dest]);
  }
  return spawnProcess('magick', ['convert', path, '-thumbnail', '150x150', '-strip', '-background', 'wheat', '-alpha', 'remove', dest]);
};


//保存中图
const mediumify = (path, dest) => {
  if(linux) {
    return spawnProcess('convert', [path, '-thumbnail', '640x640', '-strip', '-background', 'wheat', '-alpha', 'remove', dest]);
  }
  return spawnProcess('magick', ['convert', path, '-thumbnail', '640x640', '-strip', '-background', 'wheat', '-alpha', 'remove', dest]);
}


module.exports = {
  moveFile,
  replaceFileExtension,
  deleteFile,
  accessFile,
  getVideoInfo,
  getAudioInfo,
  getFileInfo,
  getFileSize,
  spawnProcess,
  storeClient,
  getPictureSize,
  info,
  allInfo,
  imageNarrow,
  watermarkify,
  addWaterMask,
  ffmpegImageFilter,
  addImageTextWaterMaskForImage,
  thumbnailify,
  mediumify,
  getImageSize,
  getDrawTextSize,
}