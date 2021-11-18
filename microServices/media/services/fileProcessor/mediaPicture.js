const ff = require("fluent-ffmpeg");
const PATH = require('path');
const {
  getFileInfo,
  deleteFile,
  storeClient,
  spawnProcess
} = require('../../tools');
const tools = require('../../tools');
const {platform} = require("os");
const {sendResourceStatusToNKC} = require('../../socket')
const os = platform();
const linux = (os === 'linux');
module.exports = async (props) => {
  const {
    file,
    cover,
    data,
    storeUrl
  } = props;
  const {waterGravity, mediaPath, timePath, rid, toc, disposition} = data;
  const filePath = file.path;//临时目录
  const targetFilePath = filePath + `.temp.jpg`;
  const time = (new Date(toc)).getTime();


  //识别图片信息并自动旋转，去掉图片的元信息
  await tools.imageAutoOrient(filePath);
  //获取文件所在目录
  //获取图片尺寸
  const {width, size, ext, hash} = await tools.getFileInfo(filePath);
  const filenamePath = `${rid}.${ext}`;
  const filesInfo = {
    def: {
      ext,
      size,
      hash,
      disposition,
      filename: filenamePath
    }
  };//用于存储在数据库的文件类型
  const path = PATH.join(mediaPath, timePath, filenamePath);
  const storeData = [{
    filePath: filePath,
    path,
    time,
  }];
  if(ext !== 'gif') {
    //缩略图
    let thumbnailPath = filePath + `_sm.${ext}`;
    //中图
    let  mediumPath = filePath + `_md.${ext}`;
    //保存水印输出图
    const output = filePath + `_ffmpeg.${ext}`;
    //小图在存储服务中的 路径
    const smStorePath = PATH.join(mediaPath, timePath, `${rid}_sm.${ext}`);
    //中图在存储服务中的路径
    const mdStorePath = PATH.join(mediaPath, timePath, `${rid}_md.${ext}`);

    //如果图片的尺寸达到限定值将图片压缩
    if(size > 500000 || width > 1920) {
      await imageNarrow(filePath);
    }
    Promise.resolve()
      .then(() => {
        //保存小图和大图并打水印
        return saveffmpeg(filePath, cover, waterGravity, output, thumbnailPath, mediumPath, width, size)
          .then(() => {
            storeData.push({
              filePath: thumbnailPath,
              path: smStorePath,
              time,
            })
          })
          .then((() => {
            storeData.push({
              filePath: mediumPath,
              path: mdStorePath,
              time,
            })
          }))
          .then(() => {
            const smInfo = tools.getFileInfo(thumbnailPath);
            const mdInfo = tools.getFileInfo(mediumPath);
            filesInfo.sm = {
              ext: smInfo.ext,
              size: smInfo.size,
              hash: smInfo.hash,
              disposition,
              filename: smStorePath
            };
            filesInfo.md = {
              ext: mdInfo.ext,
              size: mdInfo.size,
              hash: mdInfo.hash,
              disposition,
              filename: mdStorePath
            }
          })
      })
      .then(() => {
        //将图片推送到存储服务
        return storeClient(storeUrl, storeData);
      })
      .then(() => {
        // 发送文件处理的状态
        return sendResourceStatusToNKC({
          rid,
          status: true,
          filesInfo
        });
      })
      .catch(err => {
        console.log(err);
        return sendResourceStatusToNKC({
          rid,
          status: false,
          error: err.message || err.toString()
        });
      })
      .then(() => {
        return deleteFile(thumbnailPath);
      })
      .then(() => {
        return deleteFile(mediumPath);
      })
      .then(() => {
        return deleteFile(filePath);
      })
      .then(() => {
        return deleteFile(cover.path);
      })
      .then(() => {
        return deleteFile(output);
        console.log(storeData, filesInfo);
      })
      .catch(err => {
        console.log(err);
      })
  }
}

//图片打水印
async function ffmpegWaterMark(filePath, cover, waterGravity, output){
  return Promise.resolve()
    .then(() => {
       return addImageTextWaterMaskForImage({
        input: filePath,
        output: output,
        image: cover.path,
        text: '',
        transparency: 100,
        position: gravityToPositionMap[waterGravity],
      })
    })
    .then(() => {

    })
    .catch(err => {
      console.log(err);
    });
}


//保存缩略图
function saveffmpeg (filePath, cover, waterGravity, output, thumbnailPath, mediumPath, width, size) {
  return ffmpegWaterMark(filePath, cover, waterGravity, output)
    .then(() => {
      if(width > 150 || size > 51200){
        //保存缩略图
        if(linux) {
          return spawnProcess('convert', [output, '-thumbnail', '150x150', '-strip', '-background', 'wheat', '-alpha', 'remove', thumbnailPath]);
        } else {
          return spawnProcess('magick', ['convert', output, '-thumbnail', '150x150', '-strip', '-background', 'wheat', '-alpha', 'remove', thumbnailPath]);
        }
      }
      // return getFileInfo(targetFilePath);
    })
    .then(() => {
      if (width > 640 || size > 102400) {
        //保存中图
        if(linux) {
          return spawnProcess('convert', [output, '-thumbnail', '640x640', '-strip', '-background', 'wheat', '-alpha', 'remove', mediumPath]);
        } else {
          return spawnProcess('magick', ['convert', output, '-thumbnail', '640x640', '-strip', '-background', 'wheat', '-alpha', 'remove', mediumPath]);
        }
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

// 图片缩小
const imageNarrow = path => {
  return spawnProcess('magick', ['convert', path, '-resize', `1920>`,path])
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
    flex = 0.08,
    position,
    transparency = 100,
    additionOptions
  } = op;
  const {height: imageHeight, width: imageWidth} = await tools.getFileInfo(input);
  const {size} = await tools.getFileInfo(image);
  const logoSize = size;
  let padHeight = ~~((imageHeight > imageWidth? imageWidth: imageHeight) * flex);
  let logoHeight = padHeight - 1;
  let logoWidth = ~~(logoSize.width * (logoHeight / logoSize.height)) - 1;
  const fontSize = padHeight - 10;
  const gap = ~~(logoWidth * 0.1); /* logo和文字之间和间隔 */
  let padWidth = logoWidth + gap;
  image = image.replace(/\\/g, "/").replace(":", "\\:");
  return ffmpegImageFilter(input, output, [
    `movie='${image}'[logo]`,
    `[logo]scale=${logoWidth}:${logoHeight}[image]`,
    `[image]drawtext=x=${logoWidth + gap}:y=${logoHeight}/2:text='':fontsize=${fontSize}:fontcolor=fcfcfc:fontfile=':shadowcolor=b1b1b1:shadowx=1:shadowy=1', lut=a=val*1[watermask]`,
    `[0:v][watermask]overlay=${position.x}:${position.y}`
  ], additionOptions)
}

// 方位和position参数的映射关系
const gravityToPositionMap = {
  southeast: {
    x: "W-w-10",
    y: "H-h-10"
  },
  northeast: {
    x: "W-w-10",
    y: "10"
  },
  southwest: {
    x: "10",
    y: "H-h-10"
  },
  northwest: {
    x: "10",
    y: "10"
  },
  center: {
    x: "(W-w)/2",
    y: "(H-h)/2"
  }
};