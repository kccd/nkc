const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const schema = new Schema({
  _id: Number,
  disabled: { // 是否屏蔽该试卷
    type: Boolean,
    default: false,
    index: 1
  },
  volume: { // 试卷难度
    type: String,
    default: 'A'
  },
  uid: {
    type: String,
    required: true
  },
  order: { // 考卷排序
    type: Number,
    default: 1,
    index: 1
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  name: { // 考卷名称
    type: String,
    required: true
  },
  description: { // 考卷介绍
    type: String,
    default: ''
  },
  passScore: { // 及格分数
    type: Number,
    default: 10
  },
  time: { // 考试时间
    type: Number,
    default: 30 // 默认考试时间为30分钟
  },
  rolesId: { // 通过后颁发的证书
    type: [String],
    default: []
  },
  from: { // 考卷试题来源
    type: Schema.Types.Mixed,
    default: []
  }
  /* from: [
    {
      type: { // pub: public, pro: professional
        type: String,
        required: true
      },
      fid: { // 专业ID
        type: String,
        default: ''
      },
      count: { // 从该专业抽取试题的数量
        type: Number,
        default: 1
      }
    }
  ], */
}, {
  collection: 'examsCategories'
});
module.exports = mongoose.model('examsCategories', schema);