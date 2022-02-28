const mongoose = require('../settings/database');

const schema = new mongoose.Schema({
  _id: String,
  // 发表时间
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 发表人
  uid: {
    type: String,
    required: true,
    index: 1
  },
  // 当前动态内容所处的 document
  // 转发别人的动态时，若此字段为空字符创则表示完全转发而非引用转发
  did: {
    type: Number,
    required: true,
    index: 1
  },
  // 作为评论时此字段表示动态 ID，作为动态时此字段为空字符
  parent: {
    type: String,
    default: '',
    index: 1
  },
  // 作为评论时此字段表示层层上级 ID 组成的数组
  // 多级评论时可根据此字段查询引用树
  parents: {
    type: [String],
    default: [],
    index: 1
  },
  // 引用类型
  // moment
  // article
  quoteType: {
    type: String,
    default: '',
  },
  // 引用类型对应的 ID
  quoteId: {
    type: String,
    default: ''
  },
  // 附加的图片或视频
  // 作为动态时此字段存储
  files: {
    type: [String],
    default: [],
    index: 1
  }
});

module.exports = mongoose.model('moments', schema);
