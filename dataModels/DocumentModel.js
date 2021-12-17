const mongoose = require('../settings/database');
const customCheerio = require("../nkcModules/nkcRender/customCheerio");
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
  keywordsEn: {
    type: [String],
    default: []
  },
  // 文档关键词 中文
  keywords: {
    type: [String],
    default: []
  },
  // 文档摘要 英文
  abstractEn: {
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

schema.statics.createDocument = async (props) => {
  const {
    title,
    content,
    cover,
    uid,
    time
  } = props;
  const DocumentModel = mongoose.model('documents');
  const SettingModel = mongoose.model('settings');
  const AttachmentModel = mongoose.model('attachments');
  const documentId = await SettingModel.operateSystemID('documents');
  const wordCount = customCheerio.load(content).text();
  const document = new DocumentModel({
    _id: documentId,
    title,
    content,
    wordCount,
    uid,
    toc: time
  });
  await document.save();
  if(cover) {
    await AttachmentModel.saveDocumentCover(documentId, cover);
  }
  return document;
};

schema.methods.updateDocument = async (props) => {
  const {title, content, cover} = props;
  const AttachmentModel = mongoose.model('attachments');
  const wordCount = customCheerio.load(content).text();
  await this.updateOne({
    $set: {
      title,
      content,
      wordCount,
      tlm: new Date()
    }
  });
  if(cover) {
    await AttachmentModel.saveDocumentCover(this._id, cover);
  }
}

schema.methods.setAsHistory = async function(newDocumentId) {
  await this.updateOne({
    $set: {
      originId: newDocumentId
    }
  });
}

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