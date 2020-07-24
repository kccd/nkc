/*
* @param {File} file
* @param {Object} resource
* */

const SettingModel = require('../../../dataModels/SettingModel');
const FILE = require('../../../nkcModules/file');
const fsPromise = require('fs').promises;

module.exports = async (file, resource, user) => {
  let {path, hash} = file;
  let {rid} = resource;
  let {uid} = user;
  // 音频文件目录
  let mediaAudio = await FILE.getPath("mediaVideo", Date.now());
  // 输出音频路径
  const outputVideoPath = `${mediaAudio}/${rid}.mp3`;
  // 获取文件格式 extension
  let extension = await FILE.getFileExtension(file);

  if(['wav'].indexOf(extension.toLowerCase()) > -1) {
    await ffmpeg.audioWAVTransMP3(path, outputVideoPath);
  }else if(['amr'].indexOf(extension.toLowerCase()) > -1) {
    await ffmpeg.audioAMRTransMP3(path, outputVideoPath);
  } else if(['aac'].indexOf(extension.toLowerCase()) > -1) {
    await ffmpeg.audioAACTransMP3(path, outputVideoPath)
  } else {
    await fsPromise.copyFile(path, outputVideoPath);
  }

  // 更新数据库记录 inProcess改为 usable
  await resource.update({
    state: 'usable'
  })

  // 发送消息给前端(转换完毕了)
  global.NKC.io.of('/common').to(`user/${uid}`).send({fileId: hash, state: "audioProcessFinish"});
}
