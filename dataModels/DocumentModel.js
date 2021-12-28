const mongoose = require('../settings/database');
const schema = new mongoose.Schema({
  // 文档 ID
  _id: Number,
  // 文档的创建人
  uid: {
    type: String,
    default: '',
    index: 1
  },
  // 文档的创建时间
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 最后修改时间
  tlm: {
    type: Date,
    default: null,
    index: 1
  },
  // 封面
  cover: {
    type: String,
    default: ''
  },
  // 文档标题
  title: {
    type: String,
    default: ''
  },
  // 文档内容
  content: {
    type: String,
    default: ''
  },
  // 文档关键词 英文
  keywordsEN: {
    type: [String],
    default: []
  },
  // 文档关键词 中文
  keywords: {
    type: [String],
    default: []
  },
  // 文档摘要 英文
  abstractEN: {
    type: String,
    default: ''
  },
  // 文档摘要 中文
  abstract: {
    type: String,
    default: ''
  },
  // 是否通过审核
  reviewed: {
    type: Boolean,
    default: false,
  },
  // 文档内容字数 排除了 html 标签
  wordCount: {
    type: Number,
    default: 0
  },
  // 原始文档 ID，作为历史文档是此字段记录的原始文档的 ID
  originId: {
    type: Number,
    default: null
  },
  // 已发送过@通知的用户
}, {
  collection: 'documents'
});

schema.statics.getDocumentsObjById = async (documentsId) => {
  const DocumentModel = mongoose.model('documents');
  const documents = await DocumentModel.find({
    _id: {$in: documentsId}
  });
  const obj = {};
  for(let i = 0; i < documents.length; i++) {
    const document = documents[i];
    obj[document._id] = document;
  }
  return obj;
};

/*
* 创建 document
* @param {Object} props
*   @param {String} title 标题
*   @param {String} content 富文本内容
*   @param {File} coverFile 封面图
*   @param {String} uid 作者
*   @param {Date} time 创建时间
* @return {Object} Document
* */
schema.statics.createDocument = async (props) => {
  const {
    title,
    cover,
    content = '',
    coverFile,
    uid,
    time
  } = props;
  const DocumentModel = mongoose.model('documents');
  const SettingModel = mongoose.model('settings');
  const AttachmentModel = mongoose.model('attachments');
  const documentId = await SettingModel.operateSystemID('documents', 1);
  const {getHTMLTextLength} = require('../nkcModules/checkData');
  const wordCount = getHTMLTextLength(content);
  const document = new DocumentModel({
    _id: documentId,
    title,
    cover,
    content,
    wordCount,
    uid,
    toc: time
  });
  await document.save();
  if(coverFile) {
    await AttachmentModel.saveDocumentCover(documentId, coverFile);
  }
  return document;
};

/*
* 更新 document
* @param {Object} props
*   @param {String} title 标题
*   @param {String} content 富文本内容
*   @param {String} cover 原封面图 ID
*   @param {File} coverFile 新的封面图文件对象
* */
schema.methods.updateDocument = async function(props) {
  const {
    title = '',
    content = '',
    cover = '',
    coverFile,
  } = props;
  const {getHTMLTextLength} = require('../nkcModules/checkData');
  const AttachmentModel = mongoose.model('attachments');
  const wordCount = getHTMLTextLength(content);
  await this.updateOne({
    $set: {
      title,
      content,
      wordCount,
      cover,
      tlm: new Date()
    }
  });
  if(coverFile) {
    await AttachmentModel.saveDocumentCover(this._id, coverFile);
  }
}
/*
* 将 document 设置为历史
* @param {Number} newDocumentId 当前历史 document 所对应的新版本 document
* */
schema.methods.setAsHistory = async function(newDocumentId) {
  await this.updateOne({
    $set: {
      originId: newDocumentId
    }
  });
}

schema.methods.extendData = async function() {
  const {timeFormat, fromNow, getUrl} = require('../nkcModules/tools');
  const nkcRender = require('../nkcModules/nkcRender');
  const content = await nkcRender.renderHTML({
    type: "article",
    post: {
      c: this.content
    },
  });
  return {
    time: timeFormat(this.toc),
    coverUrl: this.cover? getUrl('documentCover', this.cover): '',
    mTime: this.tlm? fromNow(this.tlm): null,
    title: this.title || '未填写标题',
    content
  }
};

// 更新数据
schema.methods.updateData = async function(newData) {

};
// 同步到搜索数据库
schema.methods.pushToSearchDB = async function() {

};
// 获取其中的 @ 用户名称
schema.methods.sendATMessage = async function() {

};
// 获取 html 内容中的笔记选区信息
schema.methods.getNoteMarkInfo = async function() {

};
// 更新笔记选区信息
schema.methods.updateNoteInfo = async function (note) {

};
// 更新内容
schema.methods.updateContent = async function() {

};
// 保存历史
schema.methods.saveHistory = async function() {

};
// 设置审核状态
schema.methods.setReviewStatus = async function() {

};

module.exports = mongoose.model('documents', schema);
