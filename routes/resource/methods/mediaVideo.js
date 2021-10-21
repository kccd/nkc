/*
* @param {File} file
* @param {Object} resource
* */
const Big = require('big.js');
const FILE = require('../../../nkcModules/file');
const {AttachmentModel, ColumnModel, SettingModel} = require("../../../dataModels");
const imageMagick = require("../../../tools/imageMagick");
const ffmpeg = require("../../../tools/ffmpeg");
const Path = require('path');
const videoSize = require('../../../settings/video');
const fs = require('fs');
const fsPromises = fs.promises;

module.exports = async (options) => {
  let {file, resource, user} = options;
  let {path} = file;
  let {rid, toc, ext, oname} = resource;
  let {generalSettings} = user;
  let {waterSetting} = generalSettings;

  // 视频文件目录
  let videoDir = await FILE.getPath("mediaVideo", toc);
  // 输出视频路径
  let outputVideoPath = Path.resolve(videoDir, `./${rid}.mp4`);
  // 读取视频尺寸配置
  const {sd, hd, fhd} = videoSize;
  // 各个尺寸视频路径
  const sdVideoPath = Path.resolve(videoDir, `./${rid}_sd.mp4`);
  const hdVideoPath = Path.resolve(videoDir, `./${rid}_hd.mp4`);
  const fhdVideoPath = Path.resolve(videoDir, `./${rid}_fhd.mp4`);
  // 视频封面图路径
  let videoCoverPath = Path.resolve(videoDir, `./${rid}_cover.jpg`);
  // 获取文件格式 extension
  let extension = ext;

  // 如果设置了需要加水印
  if(waterSetting.waterAdd) {
    const { waterGravity, watermarkStream } = await SettingModel.getWatermarkInfoByUid(user.uid);
    const videoPath = path;

    // 获取原视频尺寸
    const {width: videoWidth, height: videoHeight} = await ffmpeg.getVideoInfo(videoPath);
    // 各个尺寸视频的宽度
    const widthSD = sd.height * videoWidth / videoHeight;
    const widthHD = hd.height * videoWidth / videoHeight;
    const widthFHD = fhd.height * videoWidth / videoHeight;
    // 各个视频的比特率
    const bitrateSD = await SettingModel.getBitrateBySize(widthSD, sd.height);
    const bitrateHD = await SettingModel.getBitrateBySize(widthHD, hd.height);
    const bitrateFHD = await SettingModel.getBitrateBySize(widthFHD, fhd.height);

    const isReachFHD = videoHeight >= fhd.height;
    const isReachHD  = !isReachFHD && videoHeight >= hd.height;
    const isReachSD  = !isReachHD  && videoHeight >= sd.height;
    
    const waterMaskPosition = gravityToPositionMap[waterGravity];
    await ffmpeg.addWaterMask({
      videoPath,
      output: outputVideoPath,
      imageStream: watermarkStream,
      position: waterMaskPosition,
      scalaByHeight: isReachFHD
        ? fhd.height
        : isReachHD
        ? hd.height
        : isReachSD
        ? sd.height
        : videoHeight,
      bitRate: isReachFHD
        ? bitrateFHD
        : isReachHD
        ? bitrateHD
        : isReachSD
        ? bitrateSD
        : await SettingModel.getBitrateBySize(videoWidth, videoHeight)
    });
  } else {
    // 视频转码
    if(['3gp'].indexOf(extension.toLowerCase()) > -1){
      await ffmpeg.video3GPTransMP4(path, outputVideoPath);
    }else if(['mp4'].indexOf(extension.toLowerCase()) > -1) {
      await ffmpeg.videoMP4TransH264(path, outputVideoPath);
    }else if(['mov'].indexOf(extension.toLowerCase()) > -1) {
      await ffmpeg.videoMOVTransMP4(path, outputVideoPath);
    }else if(['avi'].indexOf(extension.toLowerCase()) > -1) {
      await ffmpeg.videoAviTransAvi(path, path);
      await ffmpeg.videoAVITransMP4(path, outputVideoPath);
    } else if(['webm'].includes(extension.toLowerCase())) {
      await ffmpeg.videoWEBMTransMP4(path, outputVideoPath);
    } else {
      await ffmpeg.videoTransMP4(path, outputVideoPath, extension);
    }
  }

  // 生成视频封面图
  await ffmpeg.videoFirstThumbTaker(path, videoCoverPath);
  // 获取封面图的高宽
  const videoCoverInfo = await imageMagick.info(videoCoverPath);
  let height = videoCoverInfo.height;
  let width = videoCoverInfo.width;

  // 获取原视频尺寸
  const {width: originWidth, height: originHeight} = await ffmpeg.getVideoInfo(outputVideoPath);
  // 各个尺寸视频的宽度
  const widthSD = sd.height * originWidth / originHeight;
  const widthHD = hd.height * originWidth / originHeight;
  const widthFHD = fhd.height * originWidth / originHeight;
  // 各个视频的比特率
  const bitrateSD = await SettingModel.getBitrateBySize(widthSD, sd.height);
  const bitrateHD = await SettingModel.getBitrateBySize(widthHD, hd.height);
  const bitrateFHD = await SettingModel.getBitrateBySize(widthFHD, fhd.height);

  // 生成其他尺寸的视频文件
  if(originHeight < hd.height) {
    // 原视频小于720，则将其设置为480
    await fsPromises.rename(outputVideoPath, sdVideoPath);
  } else if(originHeight < fhd.height) {
    // 原视频大于等于720且小于1080，则将其设置为720并生成480的视频
    const newOutputVideoPath = hdVideoPath;
    await fsPromises.rename(outputVideoPath, newOutputVideoPath);
    await ffmpeg.createOtherSizeVideo(newOutputVideoPath, sdVideoPath, {
      height: sd.height,
      bitrate: bitrateSD,
      fps: sd.fps
    });
  } else {
    // 原视频大于等于1080，则将其设置为1080并生成720和480的视频
    const newOutputVideoPath = fhdVideoPath;
    await fsPromises.rename(outputVideoPath, newOutputVideoPath);
    const tasks = [
      ffmpeg.createOtherSizeVideo(newOutputVideoPath, sdVideoPath, {
        height: sd.height,
        bitrate: bitrateSD,
        fps: sd.fps
      }),
      ffmpeg.createOtherSizeVideo(newOutputVideoPath, hdVideoPath, {
        height: hd.height,
        bitrate: bitrateHD,
        fps: hd.fps
      })
    ];
    await Promise.all(tasks);
  }

  oname = oname.split('.');
  oname[oname.length - 1] = 'mp4';
  oname = oname.join('.');

  // 更新数据库记录 inProcess改为 usable
  await resource.updateOne({
    state: 'usable',
    ext: 'mp4',
    oname,
    height,
    width,
  })
}

// 默认的视频码率和帧率控制参数
const bitrateAndFPSControlParameter = {
  'c:v': 'libx264',                                            /* 指定编码器 */
  'r': '24',                                                   /* 帧率 */
  'maxrate': '5M',                                             /* 最大码率 */
  'minrate': '1M',                                             /* 最小码率 */
  'b:v': '1.16M',                                              /* 平均码率 */
};

// 对象转参数数组
function objectToParameterArray(obj) {
  let arr = [];
  Object.keys(obj).forEach(name => {
    arr.push("-" + name);
    arr.push(obj[name]);
  });
  return arr;
}

// 计算出码率控制参数
async function calcBitrateControlParameter(videoPath, videoVBRControl) {
  // 获取视频尺寸
  let videoSize = await ffmpeg.getVideoSize(videoPath);
  // 计算视频像素
  let videoPixel = videoSize.width * videoSize.height;
  // 获取视频比特率
  let bitrate = await ffmpeg.getVideoBitrate(videoPath);
  bitrate = bitrate / 1024 / 1024;
  // console.log(videoSize);
  let params = {...bitrateAndFPSControlParameter};
  // 待选码率，因为可能匹配到多条配置，取其中最小的
  let waitCheakBitrates = [];
  // 匹配配置
  let {configs, defaultBV} = videoVBRControl;
  for(let config of configs) {
    let {from, to, bv} = config;
    if(videoPixel >= from && videoPixel < to) {
      waitCheakBitrates.push(bv);
    }
  }
  // 选出最小的平均码率
  let minAverageBitrate;
  if(waitCheakBitrates.length === 0) {
    minAverageBitrate = new Big(defaultBV);
  } else {
    minAverageBitrate = new Big(Math.min.apply(this, waitCheakBitrates));
  }
  // 如果配置的平均码率比原视频的码率还小，就不使用配置
  if(parseInt(minAverageBitrate) > bitrate) {
    delete params["maxrate"];
    delete params["minrate"];
    delete params["b:v"];
    return params;
  }
  // 计算最大和最小码率
  let maxBitrate = minAverageBitrate.plus(2);
  let minBitrate = minAverageBitrate.gte(3)
                    ? minAverageBitrate.minus(2)
                    : 0;
  params["maxrate"] = `${maxBitrate}M`;
  params["minrate"] = `${minBitrate}M`;
  params["b:v"] = `${minAverageBitrate}M`;
  return params;
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
