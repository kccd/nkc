const { documentSources, documentTypes } = require('../../settings/document');
const DocumentModel = require('../../dataModels/DocumentModel');
const apiFunction = require('../../nkcModules/apiFunction');
const { timeFormat } = require('../../nkcModules/tools');
const diff = require('../../nkcModules/diff');
const xss = require('xss');

class MomentHistoryService {
  async getMomentHistoryList(props) {
    const { resourceListService } = require('../resource/resourceList.service');
    const { momentFileService } = require('./momentFile.service');
    const { momentId, page = 0 } = props;
    const match = {
      source: documentSources.moment,
      sid: momentId,
      type: {
        $in: [documentTypes.stableHistory, documentTypes.stable],
      },
    };
    const count = await DocumentModel.countDocuments(match);
    const paging = apiFunction.paging(page, count);
    const documents = await DocumentModel.find(match, {
      _id: 1,
      did: 1,
      tlm: 1,
      toc: 1,
      content: 1,
      files: 1,
    })
      .sort({ tlm: -1 })
      .skip(paging.start)
      .limit(paging.perpage);

    const resourcesId = [];
    for (const document of documents) {
      resourcesId.push(...document.files);
    }
    const resourcesObj =
      await resourceListService.getResourcesObjectByResourcesId([
        ...new Set(resourcesId),
      ]);
    const histories = [];
    for (let i = 0; i < documents.length; i++) {
      const document = documents[i];
      const { files, content, _id, did, tlm, toc } = document;
      const filesData = [];
      for (const rid of files) {
        const resource = resourcesObj[rid];
        if (!resource) {
          continue;
        }
        const fileData = await momentFileService.extendMomentFile(resource);
        filesData.push(fileData);
      }
      let contentDiff = content;
      if (i < documents.length - 1) {
        const preContent = documents[i + 1].content;
        contentDiff = this.filterHistoryContentDiff(
          diff.contentDiff(preContent, content),
        );
      }
      histories.push({
        _id,
        did,
        time: timeFormat(tlm || toc),
        content,
        contentDiff,
        filesData,
      });
    }
    return {
      histories,
      paging,
    };
  }

  filterHistoryContentDiff(content) {
    return content;
    return xss(content, {
      whiteList: {
        span: ['class'],
      },
    });
  }
}

module.exports = {
  momentHistoryService: new MomentHistoryService(),
};
