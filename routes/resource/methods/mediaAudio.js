/*
* @param {File} file
* @param {Object} resource
* */

const FILE = require('../../../nkcModules/file');
const fsPromise = require('fs').promises;
const Path = require("path");
const ffmpeg = require('../../../tools/ffmpeg');

module.exports = async (options) => {
  let {file, resource} = options;
  let {path} = file;
  let {rid, toc, ext, oname} = resource;
  // 音频文件目录
  let mediaAudio = await FILE.getPath("mediaAudio", toc);
  // 输出音频路径
  const outputVideoPath = Path.resolve(mediaAudio, `./${rid}.mp3`);
  // 获取文件格式 extension
  let extension = ext;

  if(['wav'].indexOf(extension.toLowerCase()) > -1) {
    await ffmpeg.audioWAVTransMP3(path, outputVideoPath);
  }else if(['amr'].indexOf(extension.toLowerCase()) > -1) {
    await ffmpeg.audioAMRTransMP3(path, outputVideoPath);
  } else if(['aac'].indexOf(extension.toLowerCase()) > -1) {
    await ffmpeg.audioAACTransMP3(path, outputVideoPath)
  } else if(['flac'].includes(extension.toLocaleString())) {
    await ffmpeg.audioFLACTransMP3(path, outputVideoPath)
  } else {
    await fsPromise.copyFile(path, outputVideoPath);
  }

  oname = oname.split('.');
  oname[oname.length - 1] = 'mp3';
  oname = oname.join('.');
  // 更新数据库记录 inProcess改为 usable
  await resource.updateOne({
    state: 'usable',
    oname,
    ext: 'mp3'
  });
}
