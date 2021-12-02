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
});


// 更新数据
schema.methods.updateData = async function(newData) {

};
// 同步到搜索数据库
schema.methods.pushToSearchDB = async function() {

};
// 获取其中的 @ 用户名称
schema.methods.sendATMessage = async function() {

};
schema.methods.getNoteMarkInfo = async function() {

};
schema.methods.updateNoteInfo = async function (note) {

};
schema.methods.updateContent = async function() {

};
schema.methods.saveHistory = async function() {

};
schema.methods.setReviewStatus = async function() {

};

module.exports = mongoose.model('documents', schema);