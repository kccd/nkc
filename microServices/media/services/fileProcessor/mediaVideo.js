const PATH = require('path')
const tools = require('../../tools')
const ff = require('fluent-ffmpeg')
const Path = require('path')
module.exports = async (props) => {
  const {
    cover,
    file,
    data,
    storeUrl
  } = props;
  console.log('props', props);
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
  const videoSize = {
    sd: {
      height: 480,
      fps: 30,
    },
    hd: {
      height: 720,
      fps: 30,
    },
    fhd: {
      height: 1080,
      fps: 30,
    }
  };
  const {sd, hd, fhd} = videoSize;
  // 各个尺寸视频路径
  const sdVideoPath = PATH.resolve(filePath, `._sd.mp4`);
  const hdVideoPath = PATH.resolve(filePath, `._hd.mp4`);
  const fhdVideoPath = PATH.resolve(filePath, `._fhd.mp4`);
  // 视频封面图路径
  let videoCoverPath = Path.resolve(filePath, `._cover.jpg`);
  //生成多种清晰度的视频

  Promise.resolve()
    .then(() => {
      if(ext !== 'gif') {
        //视频打水印
        return ffmpegWaterMark(filePath, cover, waterGravity)
          .then(() => {
            // return getFileInfo(targetFilePath);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    })

  //视频打水印
  function ffmpegWaterMark(filePath, cover, waterGravity){
    const outputPath = filePath + `.ffmpeg.${ext}`;
    const position = gravityToPositionMap[waterGravity];
    console.log('position', position);
    addWaterMask({
      videoPath: filePath,
      imageStream: cover.path,
      output: outputPath,
      position: position});
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
      flex = 0.2,
    } = options;
    const { width, height, bitRate } = await tools.getVideoInfo(videoPath);
    return await new Promise((resolve, reject) => {
      const imageWidth = Math.min(width, height) * flex;
      ff(videoPath)
        .input(imageStream)
        .complexFilter([
          `[1:v]scale=${imageWidth}:-2[logo]`,
          `[0:v][logo]overlay=${position.x}:${position.y}[o]`,
          `[o]scale=-2:${height}`
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