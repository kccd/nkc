const mongoose = require('../settings/database');
const schema = new mongoose.Schema({
  _id: String,
  uid: {
    type: String,
    required: true,
    index: 1
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 在同级评论列表中的序号（楼层）
  order: {
    type: Number,
    default: 0,
    index: 1
  },
  // 引用来源（评论所在的系统，例如 article、book 等）
  source: {
    type: String,
    required: true,
    index: 1
  },
  // 引用来源 ID
  sid: {
    type: String,
    required: true,
    index: 1
  }
}, {
  collection: 'comments'
});

/*
* 获取评论的有效来源
* */
schema.statics.getCommentSources = async () => {
  return {
    article: 'article',
    book: 'book'
  };
}
/*
* 检测来源的合法性
* @param {String} source
* */
schema.statics.checkCommentSource = async (source) => {
  const CommentModel = mongoose.model('comments');
  const sources = await CommentModel.getCommentSources();
  const sourceNames = Object.values(sources);
  if(!sourceNames.includes(source)) throwErr(500, `comment source error. source=${source}`);
};
module.exports = mongoose.model('comments', schema);