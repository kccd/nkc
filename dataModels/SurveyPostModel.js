const mongoose = require("../settings/database");
const Schema = mongoose.Schema;
const schema = new Schema({
  _id: Number,
  surveyId: {
    type: Number,
    required: true,
    index: 1
  },
  surveyType: {
    type: String,
    required: true,
    index: 1
  },
  uid: {
    type: String,
    default: "",
    index: 1
  },
  options: {
    type: Schema.Types.Mixed,
    default: []
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  ip: {
    type: String,
    default: '',
    index: 1
  },
  port: {
    type: String,
    default: ""
  }
}, {
  collection: "surveyPosts"
});
/*
* 判断是否满足奖励资格，满足则生成账单
* @param {Number} surveyId 调查表单ID
* @param {String} uid 用户ID
* @author pengxiguaa 2019-9-5
* */
schema.statics.rewardPost = async (options) => {
  const {uid, ip, port, surveyId} = options;
  if(!uid) return;
  const SurveyModel = mongoose.model("surveys");
  const UserModel = mongoose.model("users");
  const survey = await SurveyModel.findOne({_id: surveyId});
  if(!survey) throwErr(500, `未找到ID为${surveyId}的调查表单`);
  if(survey.uid === uid) return;
  const user = await UserModel.findOne({uid});
  if(!user) return;
  const targetUser = await UserModel.findOne({uid: survey.uid});
  const {reward} = survey;
  if(!reward.status) return;
  if(reward.rewardCount <= reward.rewardedCount) return;
  if(reward.onceKcb > targetUser.kcb) return;
  const KcbsRecordModel = mongoose.model("kcbsRecords");
  const SettingModel = mongoose.model("settings");
  const record = KcbsRecordModel({
    _id: await SettingModel.operateSystemID("kcbsRecords", 1),
    type: "postSurvey",
    from: targetUser.uid,
    to: user.uid,
    num: reward.onceKcb,
    tid: surveyId,
    ip,
    port
  });
  await record.save();
  setTimeout(async () => {
    await UserModel.updateUserKcb(targetUser.uid);
    await UserModel.updateUserKcb(user.uid);
  });
  return record;
};

module.exports = mongoose.model("surveyPosts", schema);