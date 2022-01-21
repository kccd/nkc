const mongoose = require('../settings/database');
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
  cid: {
    type: [String],
    default: [],
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


/*
* 创建文档和草稿
* */
schema.statics.createDraft = async (props) => {
  const SettingModel = mongoose.model('settings');
  const DocumentModel = mongoose.model('documents');
  const CreationDraftsModel = mongoose.model('creationDrafts');
  const {uid, title , content} = props;
  const {draft: documentSource} = await DocumentModel.getDocumentSources();
  const toc = new Date();
  const Did = await SettingModel.getNewId();
  //创建文档
  const document = await DocumentModel.createBetaDocument({
    uid,
    content,
    title,
    toc,
    source: documentSource,
    sid: Did,
  });
  await document.setReviewStatus(DocumentModel.getDocumentStatus().normal);
  const draft = new CreationDraftsModel({
    _id: Did,
    uid,
    toc,
    did: document.did,
  });
  await draft.save();
  return draft;
}

/*
* 拓展草稿
* */
schema.statics.extentDrafts = async function (drafts) {
  const DocumentModel = mongoose.model('documents');
  const nkcRender = require("../nkcModules/nkcRender");
  const  arr = [];
  const obj = {};
  for(const d of drafts) {
    arr.push(d.did);
  }
  const documents = await DocumentModel.find({did: {$in: arr}}, {
    _id: 1,
    uid: 1,
    tlm: 1,
    toc: 1,
    title: 1,
    cover: 1,
    did: 1,
    type: 1,
    content: 1,
  });
  const _drafts = [];
  for(const d of documents) {
    d.content = await nkcRender.htmlToPlain(d.content, true, 300);
    obj[d.did] = d;
  }
  for(const d of drafts) {
    d.document = obj[d.did];
    const n = d.toObject();
    _drafts.push(n);
  }
  return _drafts;
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
  this.updateOne({
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
schema.methods.saveDraft = async function() {
  const DocumentModel = mongoose.model('documents');
  const {draft: documentSource} = await DocumentModel.getDocumentSources();
  const {did} = this;
  await DocumentModel.copyBetaToHistoryBySource(documentSource, this._id);
}

module.exports = mongoose.model('creationDrafts', schema);
