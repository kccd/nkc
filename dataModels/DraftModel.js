const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const draftSchema = new Schema({
  // 编辑器内的内容
  c: {
    type: String,
    default: ''
  },
  // 内容格式
  l: {
    type: String,
    default: ''
  },
  // 标题
  t: {
    type: String,
    default: ''
  },
  // 草稿类型
  desType: {
    type: String,
    default: 'forum',
    index: 1
  },
  // 草稿对应类型的ID， tid,pid等
  desTypeId: {
    type: String,
    default: '',
    index: 1
  },
  // 草稿拥有者
  uid: {
    type: String,
    required: true,
    index: 1
  },
  // 草稿ID
  did: {
    type: String,
    default: 0,
    index: 1
  },
  // 创建的时间
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 最后修改时间
  tlm: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 中文摘要
  abstractCn: {
    type: String,
    default: "",
  },
  // 英文摘要
  abstractEn: {
    type: String,
    default: "",
  },
  // 作者信息
  authorInfos: {
    type: Array,
    default: []
  },
  // 中文关键词
  keyWordsCn: {
    type: Array,
    default: []
  },
  // 英文关键词
  keyWordsEn: {
    type: Array,
    default: []
  },
  // 申明原创
  originState: {
    type: String,
    default: "0"
  },
  // 是否匿名
  anonymous: {
    type: Boolean,
    default: false,
  },
  // 专业分类
  mainForumsId: {
    type: [String],
    default: []
  },
  // 文章分类
  categoriesId: {
    type: [String],
    default: []
  },
  // 调查ID
  surveyId: {
    type: Number,
    default: null
  },
  // 封面图
  cover: {
    type: String,
    default: ""
  },
  // 作为评论 上级postId
  parentPostId: {
    type: String,
    default: ""
  },
  // 多维分类Id
  tcId: {
    type: [Number],
    default: []
  }
});

/*
* 通过草稿ID删除草稿，若草稿上有调查表ID则删除调查表
* @param {String} id 草稿ID
* @param {String} uid 草稿的创建人
* @author pengxiguaa 2019-9-17
* */
draftSchema.statics.removeDraftById = async (id, uid) => {
  const DraftModel = mongoose.model("draft");
  const SurveyModel = mongoose.model("surveys");
  const draft = await DraftModel.findOne({did: id, uid});
  if(!draft) return;
  // if(!draft) throwErr(500, `未找到ID为${id}的草稿`);
  await draft.deleteOne();
  if(draft.surveyId) {
    await SurveyModel.deleteOne({uid, _id: draft.surveyId});
  }
};

module.exports = mongoose.model('draft', draftSchema);
