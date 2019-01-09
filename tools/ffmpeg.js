const {spawn, exec} = require('child_process');
const settings = require('../settings');
const {banner, watermark, fontTtf} = settings.statics;
const {avatarSize, sizeLimit, avatarSmallSize, forumAvatarSize, webLogoSize, webSmallLogoSize, userBannerSize} = settings.upload;
const {promisify} = require('util');
const {platform} = require('os');
const fs = require('fs');
const {stat, unlink} = fs;
const path = require('path');
const __projectRoot = path.resolve(__dirname, `../`);
const {upload} = require('../settings');
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
  return spawnProcess('ffmpeg', ['-i', inputPath, '-movflags', 'faststart', '-y', outputPath]);
}

// MP4转码为H264
const videoMP4TransH264 = async (inputPath, outputPath) => {
  return spawnProcess('ffmpeg', ['-i', inputPath, '-vcodec', 'libx264', '-acodec', 'copy', '-movflags', 'faststart', '-y', outputPath]);
}

// MOV转码为MP4
const videoMOVTransMP4 = async (inputPath, outputPath) => {
  return spawnProcess('ffmpeg', ['-i', inputPath, '-vcodec', 'libx264', '-movflags', 'faststart', '-y', outputPath])
}

// AVI转码为MP4
const videoAVITransMP4 = async (inputPath, outputPath) => {
  return spawnProcess('ffmpeg', ['-i', inputPath, '-movflags', 'faststart', '-y', outputPath])
}

// AMR转码为MP3
const audioAMRTransMP3 = async (inputPath, outputPath) => {
  return spawnProcess('ffmpeg', ['-i', inputPath, outputPath])
}

// WAV转码为MP3
const audioWAVTransMP3 = async (inputPath, outputPath) => {
  return spawnProcess('ffmpeg', ['-i', inputPath, outputPath])
}

// WMA转码为MP3
const audioWMATransMP3 = async (inputPath, outputPath) => {
  return spawnProcess('ffmpeg', ['-i', inputPath, outputPath])
}
module.exports = {
  videoFirstThumbTaker,
  videoTranscode,
  videoReduceRate,
  videoMoveMetaToFirstThumb,
  videoSetPixelAndscale,
  video3GPTransMP4,
  videoMP4TransH264,
  videoMOVTransMP4,
  videoAVITransMP4,
  audioAMRTransMP3,
  audioWAVTransMP3,
  audioWMATransMP3
};
