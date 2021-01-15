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

module.exports = async (options) => {
  let {file, resource, user} = options;
  let {path} = file;
  let {rid, toc, ext} = resource;
  let {generalSettings} = user;
  let {waterSetting} = generalSettings;

  // 视频文件目录
  let videoDir = await FILE.getPath("mediaVideo", toc);
  // 输出视频路径
  let outputVideoPath = Path.resolve(videoDir, `./${rid}.mp4`);
  // 视频封面图路径
  let videoCoverPath = Path.resolve(videoDir, `./${rid}_cover.jpg`);
  // 获取文件格式 extension
  let extension = ext;

  const watermarkSettings = await SettingModel.getWatermarkSettings();
  let ffmpegTransparency = (watermarkSettings.transparency / 100).toFixed(2);

  // 如果设置了需要加水印
  if(waterSetting.waterAdd) {
    let text;
    if(waterSetting.waterStyle === "userLogo"){
      text = user? user.username : websiteName;
    }else if(waterSetting.waterStyle === "coluLogo"){
      const column = await ColumnModel.findOne({uid: user.uid});
      text = column? column.name : user.username + "的专栏";
    }else{
      text = "";
    }
    let waterSmallPath = await AttachmentModel.getWatermarkFilePath('small');
    let waterBigPath = await AttachmentModel.getWatermarkFilePath('normal');
    let videoPath = path.replace(/\\/g, "/");

    // 获得视频尺寸并计算出码率控制参数
    let {videoVBRControl} = await SettingModel.getSettings("upload");
    let additionOptions = await calcBitrateControlParameter(videoPath, videoVBRControl);
    // console.log(additionOptions);

    outputVideoPath = outputVideoPath.replace(/\\/g, "/");
    // 右下角
    if(waterSetting.waterGravity === "southeast") {
      if(waterSetting.waterStyle === "userLogo" || waterSetting.waterStyle === "coluLogo") {
        await ffmpeg.addImageTextWaterMask({
          input: videoPath,
          output: outputVideoPath,
          image: waterSmallPath,
          text,
          position: {
            x: "W-w-10",
            y: "H-h-10"
          },
          transparency: ffmpegTransparency,
          additionOptions
        });
      } else if(waterSetting.waterStyle === "siteLogo") {
        await ffmpeg.addImageWaterMask({
          videoPath,
          output: outputVideoPath,
          imagePath: waterBigPath,
          position: {x: "W-w-10", y: "H-h-10"},
          flex: 0.2,
          transparency: ffmpegTransparency,
          additionOptions
        });
      } else if(waterSetting.waterStyle === "singleLogo") {
        await ffmpeg.addImageWaterMask({
          videoPath,
          output: outputVideoPath,
          imagePath: waterSmallPath,
          position: {x: "W-w-10", y: "H-h-10"},
          transparency: ffmpegTransparency,
          additionOptions
        });
      }
    }
    // 右上角
    if(waterSetting.waterGravity === "northeast") {
      if(waterSetting.waterStyle === "userLogo" || waterSetting.waterStyle === "coluLogo") {
        await ffmpeg.addImageTextWaterMask({
          input: videoPath,
          output: outputVideoPath,
          image: waterSmallPath,
          text,
          position: {
            x: "W-w-10",
            y: "10"
          },
          transparency: ffmpegTransparency,
          additionOptions
        });
      } else if(waterSetting.waterStyle === "siteLogo") {
        await ffmpeg.addImageWaterMask({
          videoPath,
          output: outputVideoPath,
          imagePath: waterBigPath,
          position: {x: "W-w-10", y: "10"},
          flex: 0.2,
          transparency: ffmpegTransparency,
          additionOptions
        });
      } else if(waterSetting.waterStyle === "singleLogo") {
        await ffmpeg.addImageWaterMask({
          videoPath,
          output: outputVideoPath,
          imagePath: waterSmallPath,
          position: {x: "W-w-10", y: "10"},
          transparency: ffmpegTransparency,
          additionOptions
        });
      }
    }
    // 左上角
    if(waterSetting.waterGravity === "northwest") {
      if(waterSetting.waterStyle === "userLogo" || waterSetting.waterStyle === "coluLogo") {
        await ffmpeg.addImageTextWaterMask({
          input: videoPath,
          output: outputVideoPath,
          image: waterSmallPath,
          text,
          position: {
            x: "10",
            y: "10"
          },
          transparency: ffmpegTransparency,
          additionOptions
        });
      } else if(waterSetting.waterStyle === "siteLogo") {
        await ffmpeg.addImageWaterMask({
          videoPath,
          output: outputVideoPath,
          imagePath: waterBigPath,
          position: {x: "10", y: "10"},
          flex: 0.2,
          transparency: ffmpegTransparency,
          additionOptions
        });
      } else if(waterSetting.waterStyle === "singleLogo") {
        await ffmpeg.addImageWaterMask({
          videoPath,
          output: outputVideoPath,
          imagePath: waterSmallPath,
          position: {x: "10", y: "10"},
          transparency: ffmpegTransparency,
          additionOptions
        });
      }
    }
    // 左下角
    if(waterSetting.waterGravity === "southwest") {
      if(waterSetting.waterStyle === "userLogo" || waterSetting.waterStyle === "coluLogo") {
        await ffmpeg.addImageTextWaterMask({
          input: videoPath,
          output: outputVideoPath,
          image: waterSmallPath,
          text,
          position: {
            x: "10",
            y: "H-h-10"
          },
          transparency: ffmpegTransparency,
          additionOptions
        });
      } else if(waterSetting.waterStyle === "siteLogo") {
        await ffmpeg.addImageWaterMask({
          videoPath,
          output: outputVideoPath,
          imagePath: waterBigPath,
          position: {x: "10", y: "H-h-10"},
          flex: 0.2,
          transparency: ffmpegTransparency,
          additionOptions
        });
      } else if(waterSetting.waterStyle === "singleLogo") {
        await ffmpeg.addImageWaterMask({
          videoPath,
          output: outputVideoPath,
          imagePath: waterSmallPath,
          position: {x: "10", y: "H-h-10"},
          transparency: ffmpegTransparency,
          additionOptions
        });
      }
    }
    // 正中间
    if(waterSetting.waterGravity === "center") {
      if(waterSetting.waterStyle === "userLogo" || waterSetting.waterStyle === "coluLogo") {
        await ffmpeg.addImageTextWaterMask({
          input: videoPath,
          output: outputVideoPath,
          image: waterSmallPath,
          text,
          position: {
            x: "(W-w)/2",
            y: "(H-h)/2"
          },
          transparency: ffmpegTransparency,
          additionOptions
        });
      } else if(waterSetting.waterStyle === "siteLogo") {
        await ffmpeg.addImageWaterMask({
          videoPath,
          output: outputVideoPath,
          imagePath: waterBigPath,
          position: {
            x: "(W-w)/2",
            y: "(H-h)/2"
          },
          flex: 0.2,
          transparency: ffmpegTransparency,
          additionOptions
        });
      } else if(waterSetting.waterStyle === "singleLogo") {
        await ffmpeg.addImageWaterMask({
          videoPath,
          output: outputVideoPath,
          imagePath: waterSmallPath,
          position: {
            x: "(W-w)/2",
            y: "(H-h)/2"
          },
          transparency: ffmpegTransparency,
          additionOptions
        });
      }
    }
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
    }
  }

  // 生成视频封面图
  await ffmpeg.videoFirstThumbTaker(path, videoCoverPath);
  // 获取封面图的高宽
  const videoCoverInfo = await imageMagick.info(videoCoverPath);
  let height = videoCoverInfo.height;
  let width = videoCoverInfo.width;

  // 更新数据库记录 inProcess改为 usable
  await resource.update({
    state: 'usable',
    ext: 'mp4',
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
    return objectToParameterArray(params);
  }
  // 计算最大和最小码率
  let maxBitrate = minAverageBitrate.plus(2);
  let minBitrate = minAverageBitrate.gte(3)
                    ? minAverageBitrate.minus(2)
                    : 0;
  params["maxrate"] = `${maxBitrate}M`;
  params["minrate"] = `${minBitrate}M`;
  params["b:v"] = `${minAverageBitrate}M`;
  return objectToParameterArray(params);
}
