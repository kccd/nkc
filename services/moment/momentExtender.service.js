const MomentModel = require('../../dataModels/MomentModel');
const ResourceModel = require('../../dataModels/ResourceModel');
const DocumentModel = require('../../dataModels/DocumentModel');
const { momentModes, momentStatus } = require('../../settings/moment');
const { ResponseTypes } = require('../../settings/response');
const { ThrowBadRequestResponseTypeError } = require('../../nkcModules/error');
const { documentSources, documentTypes } = require('../../settings/document');
const { getRichJsonContentLength } = require('../../nkcModules/checkData');

class MomentExtenderService {
  async getMomentById(momentId) {
    const moment = await MomentModel.findOne({ _id: momentId });
    if (!moment) {
      ThrowBadRequestResponseTypeError(ResponseTypes.INVALID_MOMENT_ID, [
        momentId,
      ]);
    }
    return moment;
  }
  // 修复用户提交上来的资源id
  // 只允许添加自己的资源
  // 做多只能添加9个资源
  async fixMomentResourceId(props) {
    const { uid, resourcesId, count = 9 } = props;
    const resources = await ResourceModel.find(
      {
        uid,
        rid: { $in: resourcesId },
      },
      {
        rid: 1,
      },
    ).limit(count);
    const resourceMap = new Map(
      resources.map((resource) => [resource.rid, resource.rid]),
    );
    return resourcesId.filter((rid) => resourceMap.has(rid));
  }
  async saveRichDraftHistory(props) {
    const { content, moment } = props;
    // 判断是否需要生成历史
    const historyDocument = await DocumentModel.findOne({
      source: documentSources.moment,
      sid: moment._id,
      type: {
        $in: [documentTypes.betaHistory, documentTypes.stableHistory],
      },
    }).sort({ toc: -1 });
    let historyDocumentWordCount = 0;
    if (historyDocument) {
      historyDocumentWordCount = getRichJsonContentLength(
        historyDocument.content,
      );
    }
    const contentWordCount = getRichJsonContentLength(content);
    if (Math.abs(historyDocumentWordCount - contentWordCount) > 200) {
      await DocumentModel.copyBetaToHistoryBySource(
        documentSources.moment,
        moment._id,
      );
    }
  }
  async modifyMoment(props) {
    const { moment, content, resourcesId } = props;
    const time = new Date();
    const newResourcesId = await this.fixMomentResourceId({
      uid: moment.uid,
      resourcesId,
      count: moment.mode === momentModes.plain ? 9 : 1000000,
    });
    await DocumentModel.updateDocumentByDid(moment.did, {
      content,
      resourcesId: newResourcesId,
      tlm: time,
    });
    const match = {
      $set: {
        files: newResourcesId,
      },
    };
    if (moment.status !== momentStatus.default) {
      match.$set.tlm = time;
    }
    await moment.updateOne(match);
  }
  async getUnPublishedMomentByUid(uid, mode, parentMomentId = '') {
    return MomentModel.findOne({
      uid,
      parent: parentMomentId,
      status: momentStatus.default,
      mode,
    }).sort({ toc: -1 });
  }
  async _extendMomentMedias(resourcesId) {
    const medias = [];
    if (resourcesId.length > 0) {
      const resources = await ResourceModel.find(
        { rid: { $in: resourcesId } },
        {
          rid: 1,
          mediaType: 1,
        },
      );
      const resourcesObj = {};
      for (const resource of resources) {
        resourcesObj[resource.rid] = resource;
      }
      for (const ridItem of resourcesId) {
        const file = resourcesObj[ridItem];
        let type = '';
        if (!file || !['mediaPicture', 'mediaVideo'].includes(file.mediaType)) {
          continue;
        }
        if (file.mediaType === 'mediaPicture') {
          type = 'picture';
        } else {
          type = 'video';
        }
        medias.push({
          rid: file.rid,
          type,
        });
      }
    }
    return medias;
  }
  async getPlainEditorDataByMoment(moment) {
    const { moment: momentSource } = await DocumentModel.getDocumentSources();
    const betaDocument = await DocumentModel.getBetaDocumentBySource(
      momentSource,
      moment._id,
    );
    if (!betaDocument) {
      await moment.deleteMoment();
      return null;
    }
    const oldResourcesId = betaDocument.files;
    const medias = await this._extendMomentMedias(oldResourcesId);
    return {
      momentId: moment._id,
      toc: betaDocument.toc,
      tlm: betaDocument.tlm,
      uid: betaDocument.uid,
      content: betaDocument.content,
      medias,
    };
  }
  async getRichEditorDataByMoment(moment) {
    const { moment: momentSource } = await DocumentModel.getDocumentSources();
    const betaDocument = await DocumentModel.getBetaDocumentBySource(
      momentSource,
      moment._id,
    );
    if (!betaDocument) {
      await moment.deleteMoment();
      return null;
    }
    return {
      momentId: moment._id,
      toc: betaDocument.toc,
      tlm: betaDocument.tlm,
      uid: betaDocument.uid,
      content: betaDocument.content,
    };
  }
  async getUnPublishedMomentDataByUid(uid, parentMomentId = '') {
    const moment = await this.getUnPublishedMomentByUid(
      uid,
      momentModes.plain,
      parentMomentId,
    );
    if (!moment) {
      return null;
    }
    return this.getPlainEditorDataByMoment(moment);
  }
  async getUnPublishedMomentRichDataByUid(uid) {
    const moment = await this.getUnPublishedMomentByUid(uid, momentModes.rich);
    if (!moment) {
      return null;
    }
    return this.getRichEditorDataByMoment(moment);
  }
  async getUnPublishedMomentByMomentId(momentId, uid) {
    return MomentModel.findOne({
      uid,
      parent: '',
      _id: momentId,
      status: momentStatus.default,
    });
  }
  async getTopParentMoment(momentId) {
    const moment = await this.getMomentById(momentId);
    if (moment?.parent) {
      const parentMoment = await this.getMomentById(moment.parents[0]);
      return parentMoment;
    } else {
      return null;
    }
  }
  async getPublishedMomentDraft(momentId) {
    const moment = await this.getMomentById(momentId);
    let document = await DocumentModel.getBetaDocumentBySource(
      documentSources.moment,
      momentId,
    );
    if (!document) {
      document = await DocumentModel.findOnly({
        did: moment.did,
        source: documentSources.moment,
        type: documentTypes.stable,
      });
    }
    const medias = await this._extendMomentMedias(document.files);
    return {
      momentId,
      momentStatus: moment.status,
      toc: document.toc,
      tlm: document.tlm,
      uid: document.uid,
      content: document.content,
      medias,
    };
  }
}

module.exports = {
  momentExtenderService: new MomentExtenderService(),
};
