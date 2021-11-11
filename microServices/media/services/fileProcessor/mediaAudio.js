const ff = require("fluent-ffmpeg");
const {getFileSize} = require('../../tools');
const {sendResourceStatusToNKC} = require('../../socket');
const storeClient = require('../../../../tools/storeClient');
module.exports = async (props) => {
  const {
    file,
    data,
    storeUrl
  } = props;
  const {path, rid, time} = data;
  const filePath = file.path;
  const targetFilePath = filePath + `.temp.mp3`;
  audioToMP3(filePath, targetFilePath)
    .then(() => {
      return storeClient(storeUrl, {
        filePath: targetFilePath,
        path,
        time
      });
    })
    .then(() => {
      return getFileSize(targetFilePath);
    })
    .then(fileSize => {
      return sendResourceStatusToNKC({
        rid,
        status: true,
        info: {
          ext: 'mp3',
          size: fileSize
        }
      });
    })
    .catch(err => {
      return sendResourceStatusToNKC({
        rid,
        status: false,
        error: err.message || err.toString()
      });
    });
};

function audioToMP3(filePath, outputPath) {
  return new Promise((resolve, reject) => {
    ff(filePath)
      .output(outputPath)
      .on('end', resolve)
      .on('error', reject)
      .run()
  });
}