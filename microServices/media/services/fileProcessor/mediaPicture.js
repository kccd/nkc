const ff = require("fluent-ffmpeg");
const PATH = require('path');
const {
  getFileInfo,
  deleteFile,
  storeClient,
  spawnProcess
} = require('../../tools');
const tools = require('../../tools');
module.exports = async (props) => {
  const {
    file,
    cover,
    data,
    storeUrl
  } = props;
  const {waterGravity, mediaPath, timePath, rid, toc, ext} = data;
  const filePath = file.path;//临时目录
  const {size} = file;
  const filenamePath = `${rid}.${ext}`;
  const targetFilePath = filePath + `.temp.jpg`;
  const path = PATH.join(mediaPath, timePath, filenamePath);
  const time = (new Date(toc)).getTime();
  const storeData = [{
    filePath: filePath,
    path,
    time,
  }];
  const fileInfo = {};//用于存储在数据库的文件类型
  //识别图片信息并自动旋转，去掉图片的元信息
  await tools.allInfo(filePath);
  //获取文件所在目录
  //获取图片尺寸
  const {height, width} = await tools.info(filePath);
  //缩略图
  let thumbnailPath = PATH.resolve(filePath, '');
  //中图
  let  mediumPath = PATH.resolve(filePath, '');
  //保存图片的原图，缩略图，中图，大图
  if(width > 150 || size > 51200 && ext !== 'gif') {
  }

  //如果图片的尺寸达到限定值将图片压缩
  if(size > 500000 || width > 1920) {
    await tools.imageNarrow(filePath);
  }
  if(ext !== 'gif') {

  }
  //打水印
  // ffmpegWaterMark(filePath, cover, waterGravity)
  //   .then(() => {
  //     return getFileInfo(targetFilePath);
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
  //
  // Promise.resolve()
  //   .then(() => {
  //
  //   })ffmpegWaterMark(filePath, cover, waterGravity)
  //   .then(() => {
  //     return getFileInfo(targetFilePath);
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
  //
  // Promise.resolve()
  //   .then(() => {
  //
  //   })
  //图片打水印
  function ffmpegWaterMark(filePath, cover, waterGravity){

  }
}

//保存缩略图
function thumbnailify (path, dest) {
  if(linux) {
    return spawnProcess('convert', [path, '-thumbnail', '150x150', '-strip', '-background', 'wheat', '-alpha', 'remove', dest]);
  }
  return spawnProcess('magick', ['convert', path, '-thumbnail', '150x150', '-strip', '-background', 'wheat', '-alpha', 'remove', dest]);
}


//保存中图
function mediumify(path, dest) {
  if(linux) {
    return spawnProcess('convert', [path, '-thumbnail', '640x640', '-strip', '-background', 'wheat', '-alpha', 'remove', dest]);
  }
  return spawnProcess('magick', ['convert', path, '-thumbnail', '640x640', '-strip', '-background', 'wheat', '-alpha', 'remove', dest]);
}

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