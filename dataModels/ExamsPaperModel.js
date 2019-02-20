const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const schema = new Schema({
  _id: Number,
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
  tlm: { // 交卷的时间
    type: Date,
    default: null,
    index: 1
  },
  score: { // 试卷分数
    type: Number,
    default: 0
  },
  cid: { // 考卷的类型
    type: Number,
    required: true,
    index: 1
  },
  // 是否提交试卷
  submitted: {
    type: Boolean,
    default: false,
    index: 1
  },
  timeOut: {
    type: Boolean,
    default: false,
    index: 1
  },
  record: {
    type: [Schema.Types.Mixed],
    default: []
  },
  passed: {
    type: Boolean,
    default: null,
    index: 1
  },
  // 及格分数
  passScore: {
    type: Number,
    required: true
  },
  // 答题时间
  time: {
    type: Number,
    required: true
  }
  /*record: [
    {
      qid: { // 试题ID
        type: Number,
        required: true
      },
      answerIndex: { // 试题答案的排列顺序，与题库中的答案顺序不一样。若此时顺序为 3，0，2，1 则用户的答案为 1（对应顺序中的第二个 - 0） 才算回答正确。
        type: [Number],
        default: null
      },
      answer: { // 用户的回答 选择题：索引， 问答题：答案
        type: Schema.Types.Mixed,
        default: null
      },
      correct: { // 用户是否回答正确
        type: Boolean,
        default: null
      }
    }
  ]*/
}, {
  collection: 'examsPapers'
});

/* 
  拓展试卷的用户和分类
  @param papers: 试卷对象数组
  @author pengxiguaa 2019/2/18
*/
schema.statics.extendPapers = async (papers) => {
  const UserModel = mongoose.model('users');
  const ExamsCategoryModel = mongoose.model('examsCategories');
  const cid = new Set(), categoriesObj = {};
  const uid = new Set(), userObj = {};
  papers.map(paper => {
    cid.add(paper.cid);
    uid.add(paper.uid);
  });
  const users = await UserModel.find({uid: {$in: [...uid]}});
  users.map(user => {
    userObj[user.uid] = user;
  });
  const categories = await ExamsCategoryModel.find({_id: [...cid]});
  categories.map(category => {
    categoriesObj[category._id] = category;
  });
  return papers.map(paper => {
    const paper_ = {
      user: userObj[paper.uid],
      category: categoriesObj[paper.cid],
      _id: paper._id,
      tlm: paper.tlm,
      passed: paper.passed,
      timeOut: paper.timeOut,
      submitted: paper.submitted
    }
    return paper_;
  });
};

module.exports = mongoose.model('examsPapers', schema);