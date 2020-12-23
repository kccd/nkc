const mongoose = require('../settings/database');
const Schema = mongoose.Schema;
const typeSchema = new Schema({
  pfid: {
    type: String,
    unique: true,
    required: true
  },
  fid: {
    type: String,
    index: 1,
    default: ''
  },
  uid: {
    type: String,
    required: true,
    index: 1
  },
  info: {
		type: Object,
    required: true,
	},
	founders: {
    type: Array,
    required: true,
    index: 1
  },
  toc: {
    type: Date,
    required: true,
    default: Date.now,
    index: 1
  },
  review: {             // pendding 待处理，  resolved 已通过,   rejected 已驳回
    type: String,
    required: true,
    default: "pendding"
  },
  // 筹备专业的到期日期（审核通过之后才会有值）
  expired: {
    type: Date
  },
  formal: {
    type: Boolean,
    default: false,
    required: true
  }
},{
	collection: 'preparationForum'
});

// 创建筹备专业
typeSchema.statics.createPForum = async function(uid, info, founders) {
  let settingsModel = mongoose.model('settings');
  let preparationForumModel = mongoose.model('pForum');
  let pfid = await settingsModel.operateSystemID("pforums", 1);
  let newPForum = preparationForumModel({
    uid,
    pfid,
    info,
    founders: founders.map(uid => {
      return {
        uid,
        accept: "pending"
      }
    })
  })
  await newPForum.save();
  return pfid;
}

const preparationForumModel = mongoose.model('pForum', typeSchema);
module.exports = preparationForumModel;
