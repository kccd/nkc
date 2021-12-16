const PATH = require('path')
const tools = require('../../tools')
const ff = require('fluent-ffmpeg')
const {sendMessageToNkc} = require('../../socket')

module.exports = async (props) => {
  const {
    cover,
    file,
    data,
    storeUrl
  } = props;
  const {
    waterGravity,
    mediaPath,
    timePath,
    videoSize,
    rid,
    toc,
    flex,
    waterAdd,
    transparency,
    configs,
    defaultBV,
    enabled,
    minWidth,
    minHeight
  } = data;
  const coverPath = cover? cover.path: '';
  const filePath = file.path;//临时目录
  const time = (new Date(toc)).getTime();

  const tempFilesPath = [filePath];

  const func = async () => {
    const {width: videoWidth, height: videoHeight} = await tools.getFileInfo(filePath);
    const watermarkHeight = ~~Math.min(videoWidth, videoHeight) * (flex/100);
    const watermarkDisabled = (
      !cover ||
      videoWidth < minWidth ||
      videoHeight < minHeight ||
      !waterAdd ||
      !enabled
    );
    const videos = [];
    for(const type in videoSize) {
      const {
        height,
        fps,
      } = videoSize[type];
      if(type !== 'sd' && videoHeight < height) continue;
      const filename = `${rid}_${type}.mp4`;
      const localPath = `${filePath}_${type}.mp4`;
      videos.push({
        type,
        height,
        fps,
        filename,
        localPath,
        storePath: PATH.join(mediaPath, timePath, filename),
        bitrate: (await getBitrateBySize(height * videoWidth / videoHeight, height, configs, defaultBV)) + 'K',
      });
      tempFilesPath.push(localPath);
    }
    const outputs = videos.map(v => {
      const {height, fps, bitrate, localPath} = v;
      return {
        height,
        fps,
        bitrate,
        path: localPath
      }
    });

    const {x, y} = gravityToPositionMap[waterGravity];
    const props = {
      videoPath: filePath,
      watermark: {
        disabled: watermarkDisabled,
        path: coverPath,
        height: watermarkHeight,
        x,
        y,
        transparency
      },
      outputs
    };
    await videoProgress(props, true);
    const storeData = [];
    const filesInfo = {};
    for(const video of videos) {
      const {localPath, storePath, filename, type} = video;
      storeData.push({
        filePath: localPath,
        path: storePath,
        time,
      });
      const fileInfo = await tools.getFileInfo(localPath);
      fileInfo.name = filename;
      filesInfo[type] = fileInfo;
    }

    const coverType = 'cover';
    const videoCoverLocalPath = `${filePath}_${coverType}.jpg`;
    const videoCoverName = `${rid}_${coverType}.jpg`;
    const videoCoverStorePath = PATH.join(mediaPath, timePath, videoCoverName);
    tempFilesPath.push(videoCoverLocalPath);
    await videoFirstThumbTaker(filePath, videoCoverLocalPath);

    storeData.push({
      filePath: videoCoverLocalPath,
      path: videoCoverStorePath,
      time,
    });
    const fileInfo = await tools.getFileInfo(videoCoverLocalPath);
    fileInfo.name = videoCoverName;
    filesInfo[coverType] = fileInfo;

    await tools.storeClient(storeUrl, storeData);
    await sendMessageToNkc('resourceStatus', {
      rid,
      status: true,
      filesInfo
    });
  };

  func()
    .catch((err) => {
      console.log(err);
      return sendMessageToNkc('resourceStatus', {
        rid,
        status: false,
        error: err.message || err.toString()
      });
    })
    .finally(() => {
      return Promise.all(tempFilesPath.map(filePath => {
        return tools.deleteFile(filePath);
      }));
    })
}

// 获取视频的第一帧图片
function videoFirstThumbTaker(videoPath,imgPath) {
  return tools.spawnProcess('ffmpeg',['-i',videoPath, '-ss', '1', '-vframes' ,'1', imgPath])
}

//获取视频的比特率
// @return 比特率 Kbps
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

async function videoProgress(props, useGPU) {
  return new Promise(async (resolve, reject) => {
    const {
      videoPath,
      watermark,
      outputs
    } = props;

    const filterInputNames = [];
    const filterOutputNames = [];
    const filterModifyVideo = [];
    for(let i = 0; i < outputs.length; i ++) {
      const {
        height,
        fps,
      } = outputs[i];
      const inputName = `[video_${i}]`;
      const outputName = `[out_${i}]`;
      filterInputNames.push(inputName);
      filterOutputNames.push(outputName);
      filterModifyVideo.push(`${inputName}scale=-2:${height},fps=fps=${fps}${outputName}`);
    }

    const inputHwaccel = useGPU? ['-hwaccel', 'cuda']: [];
    const outputCodec = useGPU? ['-c:v', 'h264_nvenc']: ['-c:v', 'libx264'];

    let task = ff();
    task.input(videoPath);
    task.inputOptions([
      ...inputHwaccel,
    ]);
    if(!watermark.disabled) {
      // 打水印
      task.input(watermark.path);
      task.complexFilter([
        `[1:v]scale=-2:${watermark.height},lut=a=val*${watermark.transparency}[watermark]`,
        `[0:v][watermark]overlay=${watermark.x}:${watermark.y},split=${filterInputNames.length}${filterInputNames.join('')}`,
        ...filterModifyVideo
      ]);
    } else {
      // 不大水印
      task.complexFilter([
        `split=${filterInputNames.length}${filterInputNames.join('')}`,
        ...filterModifyVideo
      ]);
    }
    for(let i = 0; i < outputs.length; i ++) {
      const outputName = filterOutputNames[i];
      const {path, bitrate} = outputs[i];
      task.output(path);
      task.outputOptions([
        '-map',
        outputName,
        '-map',
        `0:a`,
        `-map_metadata`,
        `-1`,
        `-b:v`,
        bitrate,
        '-c:a',
        'copy',
        ...outputCodec
      ]);
    }
    task.on('end', resolve);
    task.on('error', reject);
    task.run();
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