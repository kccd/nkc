/*
* @param {File} file
* @param {Object} resource
* */
const FILE = require('../../../nkcModules/file');
const {AttachmentModel, ColumnModel, SettingModel} = require("../../../dataModels");
const imageMagick = require("../../../tools/imageMagick");
const ffmpeg = require("../../../tools/ffmpeg");

module.exports = async (file, resource, user) => {
  let { name, size, path, hash} = file;
  let {rid} = resource;
  let {generalSettings, uid} = user;
  let {waterSetting} = generalSettings;

  // 视频文件目录
  let videoDir = await FILE.getPath("mediaVideo", Date.now());
  // 输出视频路径
  let outputVideoPath = `${videoDir}/${rid}.mp4`;
  // 视频封面图路径
  let videoCoverPath = `${videoDir}/${rid}_cover.jpg`;
  // 获取文件格式 extension
  let extension = await FILE.getFileExtension(file);

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
          transparency: ffmpegTransparency
        });
      } else if(waterSetting.waterStyle === "siteLogo") {
        await ffmpeg.addImageWaterMask({
          videoPath,
          output: outputVideoPath,
          imagePath: waterBigPath,
          position: {x: "W-w-10", y: "H-h-10"},
          flex: 0.2,
          transparency: ffmpegTransparency
        });
      } else if(waterSetting.waterStyle === "singleLogo") {
        await ffmpeg.addImageWaterMask({
          videoPath,
          output: outputVideoPath,
          imagePath: waterSmallPath,
          position: {x: "W-w-10", y: "H-h-10"},
          transparency: ffmpegTransparency
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
          transparency: ffmpegTransparency
        });
      } else if(waterSetting.waterStyle === "siteLogo") {
        await ffmpeg.addImageWaterMask({
          videoPath,
          output: outputVideoPath,
          imagePath: waterBigPath,
          position: {x: "W-w-10", y: "10"},
          flex: 0.2,
          transparency: ffmpegTransparency
        });
      } else if(waterSetting.waterStyle === "singleLogo") {
        await ffmpeg.addImageWaterMask({
          videoPath,
          output: outputVideoPath,
          imagePath: waterSmallPath,
          position: {x: "W-w-10", y: "10"},
          transparency: ffmpegTransparency
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
          transparency: ffmpegTransparency
        });
      } else if(waterSetting.waterStyle === "siteLogo") {
        await ffmpeg.addImageWaterMask({
          videoPath,
          output: outputVideoPath,
          imagePath: waterBigPath,
          position: {x: "10", y: "10"},
          flex: 0.2,
          transparency: ffmpegTransparency
        });
      } else if(waterSetting.waterStyle === "singleLogo") {
        await ffmpeg.addImageWaterMask({
          videoPath,
          output: outputVideoPath,
          imagePath: waterSmallPath,
          position: {x: "10", y: "10"},
          transparency: ffmpegTransparency
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
          transparency: ffmpegTransparency
        });
      } else if(waterSetting.waterStyle === "siteLogo") {
        await ffmpeg.addImageWaterMask({
          videoPath,
          output: outputVideoPath,
          imagePath: waterBigPath,
          position: {x: "10", y: "H-h-10"},
          flex: 0.2,
          transparency: ffmpegTransparency
        });
      } else if(waterSetting.waterStyle === "singleLogo") {
        await ffmpeg.addImageWaterMask({
          videoPath,
          output: outputVideoPath,
          imagePath: waterSmallPath,
          position: {x: "10", y: "H-h-10"},
          transparency: ffmpegTransparency
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
          transparency: ffmpegTransparency
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
          transparency: ffmpegTransparency
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
          transparency: ffmpegTransparency
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
    height,
    width,
  })

  // 发送消息给前端(转换完毕了)
  global.NKC.io.of('/common').to(`user/${uid}`).send({fileId: hash, state: "videoProcessFinish"});
}
