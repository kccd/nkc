const mongoose = require('../settings/database');

const schema = new mongoose.Schema({
  // 被添加到基金黑名单的用户 ID
  uid: {
    type: String,
    required: true,
    index: 1
  },
  // 添加用户到黑名单的相应管理员 ID
  operatorUid: {
    type: String,
    required: true,
    index: 1
  },
  // 加入黑名单的时间
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 申请表所在基金项目 ID
  fundId: {
    type: String,
    default: ''
  },
  // 申请表 ID
  applicationFormId: {
    type: Number,
    default: null
  },
  // 用户被加入黑名单的理由
  reason: {
    type: String,
    default: ''
  }
}, {
  collection: 'fundBlacklist'
});

/*
* 添加用户到基金黑名单
* @param {Object}
*   @param {String} uid 用户 ID
*   @param {String} fundId 基金 ID
*   @param {Number} applicationFormId 基金申请表 ID
*   @param {String} reason 原因
* */
schema.statics.addUserToBlacklist = async (props) => {
  const FundApplicationFormModel = mongoose.model('fundApplicationForms');
  const FundBlacklistModel = mongoose.model('fundBlacklist');
  let {uid, operatorUid, fundId, applicationFormId, reason} = props;
  const bl = await FundBlacklistModel.findOne({uid});
  if(bl) {
    throwErr(400, `用户已在黑名单中`);
  }
  if(applicationFormId && !fundId) {
    const applicationForm = await FundApplicationFormModel.findOnly({_id: applicationFormId}, {fundId: 1});
    fundId = applicationForm.fundId;
  }
  const fundBlacklist = FundBlacklistModel({
    uid,
    operatorUid,
    fundId,
    applicationFormId,
    reason
  });
  await fundBlacklist.save();
  return fundBlacklist;
};

/*
* 将用户从基金黑名单中移除
* @param {String} uid 用户 ID
* */
schema.statics.removeUserFromBlacklist = async (uid) => {
  const FundBlacklistModel = mongoose.model('fundBlacklist');
  const bl = await FundBlacklistModel.findOne({uid});
  if(!bl) throwErr(400, `用户未在基金黑名单中`);
  await bl.remove();
};

/*
* 判断用户是否在基金黑名单中
* @param {String} uid 用户 ID
* @return {Boolean}
* */
schema.statics.inBlacklist = async (uid) => {
  const FundBlacklistModel = mongoose.model('fundBlacklist');
  const bl = await FundBlacklistModel.findOne({uid}, {_id: 1});
  return !!bl;
};
module.exports = mongoose.model('fundBlacklist', schema);