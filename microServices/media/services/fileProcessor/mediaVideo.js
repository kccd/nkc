const PATH = require('path')
const tools = require('../../tools')
const ff = require('fluent-ffmpeg')
const fs = require('fs')
const fsPromises = fs.promises;
const {sendResourceStatusToNKC} = require('../../socket')

module.exports = async (props) => {
  const {
    cover,
    file,
    data,
    storeUrl
  } = props;
  const {waterGravity, mediaPath, timePath, rid, toc, ext, waterAdd, configs, defaultBV, enabled, minWidth, minHeight} = data;
  const extension = ext;
  const filePath = file.path;//临时目录
  const time = (new Date(toc)).getTime();
  const storeData = [];
  const filesInfo = {};//用于存储在数据库的文件类型
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
  const sdVideoPath = filePath + `_sd.mp4`;
  const hdVideoPath = filePath + `_hd.mp4`;
  const fhdVideoPath = filePath + `_fhd.mp4`;
  // 视频封面图路径
  let videoCoverPath = filePath + `_cover.jpg`;
  //输出视频路径
  const outputVideoPath = filePath + `_ffmpeg.mp4`;
  //构建视频文件在存储服务中的路径
  const sdFilenamePath = `${rid}_sd.${ext}`;
  const hdFilenamePath = `${rid}_hd.${ext}`;
  const fhdFilenamePath = `${rid}_fhd.${ext}`;
  const videoCoverFilenamePath = `${rid}_cover.jpg`;
  const sdStorePath = PATH.join(mediaPath, timePath, sdFilenamePath);
  const hdStorePath = PATH.join(mediaPath, timePath, hdFilenamePath);
  const fhdStorePath = PATH.join(mediaPath, timePath, fhdFilenamePath);
  const videoCoverStorePath = PATH.join(mediaPath, timePath, videoCoverFilenamePath);
  //获取原视频尺寸
  const {width: videoWidth, height: videoHeight} = await tools.getFileInfo(filePath);

  const func = async () => {
    if(videoWidth >= minWidth &&
      videoHeight >= minHeight &&
      waterAdd && enabled) {

      //各个视频尺寸的宽度
      const widthSD = sd.height * videoWidth / videoHeight;
      const widthHD = hd.height * videoWidth / videoHeight;
      const widthFHD = fhd.height * videoWidth / videoHeight;
      // 各个视频的比特率
      const bitrateSD = await getBitrateBySize(widthSD, sd.height, configs, defaultBV);
      const bitrateHD = await getBitrateBySize(widthHD, hd.height, configs, defaultBV);
      const bitrateFHD = await getBitrateBySize(widthFHD, fhd.height, configs, defaultBV);

      const isReachFHD = videoHeight >= fhd.height;
      const isReachHD  = !isReachFHD && videoHeight >= hd.height;
      const isReachSD  = !isReachHD  && videoHeight >= sd.height;
      //视频打水印
      // return ffmpegWaterMark(filePath, cover, waterGravity, outputVideoPath)
      await ffmpegWaterMark({
        filePath,
        output: outputVideoPath,
        imageStream: cover.path,
        position: gravityToPositionMap[waterGravity],
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
              : getBitrateBySize(videoWidth, videoHeight)
      })
    } else {
      // 视频转码
      if(['3gp'].indexOf(extension.toLowerCase()) > -1){
        await video3GPTransMP4(filePath, outputVideoPath);
      }else if(['mp4'].indexOf(extension.toLowerCase()) > -1) {
        await videoMP4TransH264(filePath, outputVideoPath);
      }else if(['mov'].indexOf(extension.toLowerCase()) > -1) {
        await videoMOVTransMP4(filePath, outputVideoPath);
      }else if(['avi'].indexOf(extension.toLowerCase()) > -1) {
        await videoAviTransAvi(filePath, filePath);
        await videoAVITransMP4(filePath, outputVideoPath);
      } else if(['webm'].includes(extension.toLowerCase())) {
        await videoWEBMTransMP4(filePath, outputVideoPath);
      } else {
        await videoTransMP4(filePath, outputVideoPath, extension);
      }
    }

    //生成视频封面图
    await videoFirstThumbTaker(filePath, videoCoverPath);

    // 获取输出视频尺寸
    const {width: originWidth, height: originHeight} = await tools.getFileInfo(outputVideoPath);
    // 各个尺寸视频的宽度
    const widthSD = sd.height * originWidth / originHeight;
    const widthHD = hd.height * originWidth / originHeight;
    const widthFHD = fhd.height * originWidth / originHeight;
    // 各个视频的比特率
    const bitrateSD = await getBitrateBySize(widthSD, sd.height, configs, defaultBV);
    const bitrateHD = await getBitrateBySize(widthHD, hd.height, configs, defaultBV);
    const bitrateFHD = await getBitrateBySize(widthFHD, fhd.height, configs, defaultBV);
    // 生成其他尺寸的视频文件
    if(originHeight < hd.height) {
      // 原视频小于720，则将其设置为480
      await fsPromises.rename(outputVideoPath, sdVideoPath);
    } else if(originHeight < fhd.height) {
      // 原视频大于等于720且小于1080，则将其设置为720并生成480的视频
      const newOutputVideoPath = hdVideoPath;
      await fsPromises.rename(outputVideoPath, newOutputVideoPath);
      await tools.createOtherSizeVideo(newOutputVideoPath, sdVideoPath, {
        height: sd.height,
        bitrate: bitrateSD,
        fps: sd.fps
      });
    } else {
      // 原视频大于等于1080，则将其设置为1080并生成720和480的视频
      const newOutputVideoPath = fhdVideoPath;
      await fsPromises.rename(outputVideoPath, newOutputVideoPath);
      const tasks = [
        await tools.createOtherSizeVideo(newOutputVideoPath, sdVideoPath, {
          height: sd.height,
          bitrate: bitrateSD,
          fps: sd.fps
        }),
        await tools.createOtherSizeVideo(newOutputVideoPath, hdVideoPath, {
          height: hd.height,
          bitrate: bitrateHD,
          fps: hd.fps
        })
      ];
      await Promise.all(tasks);
    }

    storeData.push({
      filePath: sdVideoPath,
      path: sdStorePath,
      time,
    });

    storeData.push({
      filePath: hdVideoPath,
      path: hdStorePath,
      time,
    });

    storeData.push({
      filePath: fhdVideoPath,
      path: fhdStorePath,
      time,
    });

    storeData.push({
      filePath: videoCoverPath,
      path: videoCoverStorePath,
      time
    });

    await tools.storeClient(storeUrl, storeData);

    const sdInfo = await tools.getFileInfo(sdVideoPath);
    sdInfo.name = sdFilenamePath;
    const hdInfo = await tools.getFileInfo(hdVideoPath);
    hdInfo.name = hdFilenamePath;
    const fhdInfo = await tools.getFileInfo(fhdVideoPath);
    fhdInfo.name = fhdFilenamePath;
    const coverInfo = await tools.getFileInfo(videoCoverPath);
    coverInfo.name = videoCoverFilenamePath;

    filesInfo.sd = sdInfo;
    filesInfo.hd = hdInfo;
    filesInfo.fhd = fhdInfo;
    filesInfo.cover = coverInfo;

    await sendResourceStatusToNKC({
      rid,
      status: true,
      filesInfo
    });
  };

  func()
    .catch((err) => {
      return sendResourceStatusToNKC({
        rid,
        status: false,
        error: err.message || err.toString()
      });
    })
    .finally(() => {
      return Promise.all([
        tools.deleteFile(sdVideoPath),
        tools.deleteFile(hdVideoPath),
        tools.deleteFile(fhdVideoPath),
        tools.deleteFile(videoCoverPath),
        tools.deleteFile(filePath),
        tools.deleteFile(cover.path),
      ]);
    })
}

// ffmpeg 码率和帧率控制命令行参数 默认值
// 处理视频
const bitrateAndFPSControlParameter = [
  '-map_metadata',
  '-1',
  '-c:v', 'libx264',                                            /* 指定编码器 */
  '-r', '24',                                                   /* 帧率 */
  '-maxrate', '5M',                                             /* 最大码率 */
  '-minrate', '1M',                                             /* 最小码率 */
  '-b:v', '1.16M',                                              /* 平均码率 */
];

// 获取视频的第一帧图片
function videoFirstThumbTaker(videoPath,imgPath) {
  return tools.spawnProcess('ffmpeg',['-i',videoPath, '-ss', '1', '-vframes' ,'1', imgPath])
}

function videoTransMP4(inputPath, outputPath, ext) {
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

// webm转码为mp4
function videoWEBMTransMP4(inputPath, outputPath) {
  return tools.spawnProcess('ffmpeg', ['-i', inputPath, '-movflags', 'faststart', '-y', ...bitrateAndFPSControlParameter, outputPath])
}

// AVI转码为MP4
function videoAVITransMP4(inputPath, outputPath) {
  return tools.spawnProcess('ffmpeg', ['-i', inputPath, '-movflags', 'faststart', '-y', ...bitrateAndFPSControlParameter, outputPath])
}

// AVI格式视频转avi
function videoAviTransAvi(inputPath, outputPath) {
  return tools.spawnProcess('ffmpeg', ['-i', inputPath ,'-y', ...bitrateAndFPSControlParameter, outputPath])
}

// MOV转码为MP4
function videoMOVTransMP4(inputPath, outputPath) {
  return tools.spawnProcess('ffmpeg', ['-i', inputPath, '-vcodec', 'libx264', '-movflags', 'faststart', '-y', ...bitrateAndFPSControlParameter, outputPath])
}

// MP4转码为H264
function videoMP4TransH264(inputPath, outputPath) {
  return tools.spawnProcess('ffmpeg', ['-i', inputPath, '-vcodec', 'libx264', '-movflags', 'faststart', '-y', ...bitrateAndFPSControlParameter, outputPath]);
}

// 3GP转为MP4
function video3GPTransMP4(inputPath, outputPath) {
  return tools.spawnProcess('ffmpeg', ['-i', inputPath, '-movflags', 'faststart', '-y', ...bitrateAndFPSControlParameter, outputPath]);
}

//获取视频的比特率
function getBitrateBySize(width, height, configs, defaultBV) {
  const s =  width * height;
  let rate;
  for(const v of configs) {
    const {bv, from, to} = v;
    if(s >= from && s < to) {
      rate = bv;
      break
    }
  }
  if(!rate) {
    rate = defaultBV;
  }
  return rate * 1024;
}

//视频打水印
// function ffmpegWaterMark(filePath, cover, waterGravity, outputVideoPath){
function ffmpegWaterMark(options){
  const {filePath, output, imageStream, position, scalaByHeight, bitRate} = options;
  return addWaterMask({
    videoPath: filePath,
    imageStream: imageStream,
    output: output,
    position: position,
    scalaByHeight,
    bitRate,
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
    flex = 0.2,
    bitRate,
    scalaByHeight
  } = options;
  const { width, height} = await tools.getVideoInfo(videoPath);
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