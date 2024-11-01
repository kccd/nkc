const MomentModel = require('../../dataModels/MomentModel');
const ResourceModel = require('../../dataModels/ResourceModel');
const DocumentModel = require('../../dataModels/DocumentModel');
const { momentModes, momentStatus } = require('../../settings/moment');
const { ResponseTypes } = require('../../settings/response');
const { ThrowBadRequestResponseTypeError } = require('../../nkcModules/error');
const { documentSources, documentTypes } = require('../../settings/document');

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
    const { uid, resourcesId } = props;
    const resources = await ResourceModel.find(
      {
        uid,
        rid: { $in: resourcesId },
      },
      {
        rid: 1,
      },
    ).limit(9);
    return resources.map((resource) => resource.rid);
  }
  async modifyMoment(props) {
    const { moment, content, resourcesId } = props;
    const time = new Date();
    const newResourcesId = await this.fixMomentResourceId({
      uid: moment.uid,
      resourcesId,
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
    });
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
  async getRichEditorDataByMoment(moment) {}
  async getUnPublishedMomentDataByUid(uid, mode, parentMomentId = '') {
    const moment = await this.getUnPublishedMomentByUid(
      uid,
      mode,
      parentMomentId,
    );
    if (!moment) {
      return null;
    }
    if (mode === momentModes.plain) {
      return this.getPlainEditorDataByMoment(moment);
    } else {
      return this.getRichEditorDataByMoment(moment);
    }
  }
  async getUnPublishedMomentByMomentId(momentId, uid) {
    return MomentModel.findOne({
      uid,
      parent: '',
      _id: momentId,
      status: momentStatus.default,
    });
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
