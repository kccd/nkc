const { getUrl } = require('../../nkcModules/tools');
const videoSize = require('../../settings/video');

class MomentFileService {
  async extendMomentFile(resource) {
    await resource.setFileExist();
    const {
      mediaType,
      defaultFile,
      disabled,
      isFileExist,
      visitorAccess,
      mask,
    } = resource;

    let fileData;

    if (mediaType === 'mediaPicture') {
      const { height, width, name: filename } = defaultFile;
      fileData = {
        rid: resource.rid,
        type: 'picture',
        url: getUrl('resource', resource.rid),
        urlLG: getUrl('resource', resource.rid, 'lg'),
        height,
        width,
        filename,
        disabled,
        lost: !isFileExist,
      };
    } else {
      const { name: filename } = defaultFile;
      const sources = [];
      for (const { size, dataSize } of resource.videoSize) {
        const { height } = videoSize[size];
        const url =
          getUrl('resource', resource.rid, size) + '&w=' + resource.token;
        sources.push({
          url,
          height,
          dataSize,
        });
      }
      fileData = {
        rid: resource.rid,
        type: 'video',
        coverUrl: getUrl('resource', resource.rid, 'cover'),
        visitorAccess,
        mask,
        sources,
        filename,
        disabled,
        lost: !isFileExist,
      };
    }
    return fileData;
  }
}

module.exports = {
  momentFileService: new MomentFileService(),
};
