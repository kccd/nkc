const mongoose = require('../settings/database');
const nkcRender = require("../nkcModules/nkcRender");
const schema = new mongoose.Schema({
  _id: String,
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  tlm: {
    type: Date,
    default: null,
    index: 1
  },
  uid: {
    type: String,
    required: true,
    index: 1
  },
  did: {
    type: Number,
    default: null,
    index: 1
  },
  del: {
    type: Boolean,
    default: false,
    index: 1
  }
}, {
  collection: 'creationDrafts',
  toObject: {
    getters: true,
    virtuals: true
  }
});

schema.virtual('document')
  .get(function() {
    return this._document;
  })
  .set(function(val) {
    return this._document = val
  });

schema.statics.setStatus = async function(did, status) {
  const CreationDrafts = mongoose.model('creationDrafts');
  const draft = await CreationDrafts.findOnly({did});
  await draft.updateOne({
    $set: {
      status,
    }
  });
}
/*
* 创建文档和草稿
* */
schema.statics.createDraft = async (props) => {
  const SettingModel = mongoose.model('settings');
  const DocumentModel = mongoose.model('documents');
  const CreationDraftsModel = mongoose.model('creationDrafts');
  const {uid, title , content, ip, port} = props;
  const {draft: documentSource} = await DocumentModel.getDocumentSources();
  const toc = new Date();
  const Did = await SettingModel.getNewId();
  //创建文档
  const document = await DocumentModel.createBetaDocument({
    ip,
    port,
    uid,
    content,
    title,
    toc,
    source: documentSource,
    sid: Did,
  });
  const draft = await new CreationDraftsModel({
    _id: Did,
    uid,
    toc,
    did: document.did,
  });
  await draft.save();
  const status = await DocumentModel.getDocumentStatus();
  await document.setStatus(status.normal);
  // const draft = new CreationDraftsModel({
  //   _id: Did,
  //   uid,
  //   toc,
  //   did: document.did,
  // });
  // await draft.save();
  return draft;
}

/*
* 拓展草稿
* */
schema.statics.extentDraftsData = async function (drafts) {
  const DocumentModel = mongoose.model('documents');
  const tools = require('../nkcModules/tools');
  const nkcRender = require("../nkcModules/nkcRender");
  const documentsId = [];
  const documentsObj = {};
  for(const draft of drafts) {
    documentsId.push(draft.did);
  }
  const documents = await DocumentModel.find({did: {$in: documentsId}, type: 'beta'}, {
    did: 1,
    title: 1,
    content: 1,
  });
  const draftsData = [];
  for(const document of documents) {
    documentsObj[document.did] = document;
  }
  for(const d of drafts) {
    const {did, _id, toc, tlm, del} = d;
    const document = documentsObj[did];
    if(!document) continue;
    const {
      title = "",
      content = ""
    } = document;
    const draftData = {
      draftId: _id,
      deleted: del,
      title: title || "未填写标题",
      content: await nkcRender.htmlToPlain(content || "未填写内容", 500),
      time: tools.timeFormat(tlm || toc),
    };
    draftsData.push(draftData);
  }
  return draftsData;
}

/*
* 修改草稿和文档
* */
schema.methods.modifyDraft = async function (props) {
  const {title, content} = props;
  const DocumentModel = mongoose.model('documents');
  const {did} = this;
  const toc = new Date();
  await DocumentModel.updateDocumentByDid(did, {
    title,
    content,
    tlm: toc,
  });
  await this.updateOne({
    $set: {
      tlm: toc,
    }
  });
}

/*
* 验证草稿信息
* */
schema.statics.checkDraftInfo = async (draft) => {
  const {title, content} = draft;
  const {checkString} = require('../nkcModules/checkData');
  checkString(title, {
    name: '文章标题',
    minTextLength: 1,
    maxLength: 500
  });
  checkString(content, {
    name: '文章内容',
    maxLength: 200000,
    minTextLength: 1,
    maxTextLength: 10000,
  });
}

/*
* 提交草稿
* */
schema.methods.autoSaveDraft = async function() {
  const DocumentModel = mongoose.model('documents');
  const {draft: documentSource} = await DocumentModel.getDocumentSources();
  await DocumentModel.checkContentAndCopyBetaToHistoryBySource(documentSource, this._id);
}

schema.methods.saveDraft = async function() {
  const DocumentModel = mongoose.model('documents');
  const {draft: documentSource} = await DocumentModel.getDocumentSources();
  await DocumentModel.copyBetaToHistoryBySource(documentSource, this._id);
}


schema.statics.getDraftById = async (draftId) => {
  const CreationDraftsModel = mongoose.model('creationDrafts');
  return await CreationDraftsModel.findOnly({_id: draftId});
};

schema.statics.getUserDraftById = async (draftId, uid) => {
  const CreationDraftsModel = mongoose.model('creationDrafts');
  return await CreationDraftsModel.findOnly({_id: draftId, uid});
}

schema.methods.getDraftData = async function() {
  const DocumentModel = mongoose.model('documents');
  const {draft: sourceDraft} = await DocumentModel.getDocumentSources();
  const betaDocument = await DocumentModel.getBetaDocumentBySource(sourceDraft, this._id);
  return {
    draftId: this._id,
    did: betaDocument.did,
    docId: betaDocument._id,
    title: betaDocument.title,
    content: betaDocument.content,
    deleted: this.del,
  };
};

module.exports = mongoose.model('creationDrafts', schema);
