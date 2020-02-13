/*
* 表情相关
* 两种类型的数据。1、表情；2、表情包；
* */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  // 表情ID或表情包ID
  _id: Number,
  // 表情序号
  order: {
    type: Number,
    default: 1
  },
  // 创建者ID
  uid: {
    type: String,
    required: true,
    index: 1
  },
  // 对应附件的ID
  rid: {
    type: String,
    required: true,
    index: 1
  },
  // 表情来源
  from: {
    type: String,
    default: "upload", //upload、share
    index: 1
  },
  // 上传者ID
  tUid: {
    type: String,
    default: "",
    index: 1
  },
  // 审核 null: 未审核，true:不需要审核，false:审核未通过
  reviewed: {
    type: Boolean,
    default: true,
    index: 1
  },
  // 未通过时审核员填写的理由
  reason: {
    type: String,
    default: ""
  },
  // 是否分享
  shared: {
    type: Boolean,
    default: false,
    index: 1
  },
  // 被管理员屏蔽
  disabled: {
    type: Boolean,
    index: 1,
    default: false,
  },
  // 被用户删除
  deleted: {
    type: Boolean,
    index: 1,
    default: false
  },
  // 创建时间
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 收藏次数
  hits: {
    type: Number,
    default: 0,
    index: 1
  }
}, {
  collection: "stickers"
});
// 获取已添加的表情
schema.statics.getCollectSticker = async (rid, uid) => {
  return mongoose.model("stickers").findOne({
    rid,
    uid,
    deleted: false
  });
};
// 获取新的order
schema.statics.getNewOrder = async (uid) => {
  const StickerModel = mongoose.model("stickers");
  const latest = await StickerModel.findOne({uid}, {order: 1}).sort({order: -1});
  let order = 1;
  if(latest && latest.order) {
    order = latest.order + 1;
  }
  return order;
};
// 上传表情
schema.statics.uploadSticker = async (options) => {
  const {uid, rid, share} = options;
  const StickerModel = mongoose.model("stickers");
  const order = await StickerModel.getNewOrder(uid);
  const s = {
    _id: await mongoose.model("settings").operateSystemID("stickers", 1),
    uid,
    order,
    tUid: uid,
    rid
  };
  if(share) {
    s.reviewed = null;
  } else {
    s.reviewed = true;
  }
  const sticker = StickerModel(s);
  await sticker.save();
  return sticker;
};
// 收藏别人的表情
schema.statics.collectionSticker = async (originSticker, uid) => {
  const StickerModel = mongoose.model("stickers");
  const order = await StickerModel.getNewOrder(uid);
  const sticker = StickerModel({
    _id: await mongoose.model("settings").operateSystemID("stickers", 1),
    uid,
    order,
    reviewed: true,
    from: "share",
    tUid: originSticker.tUid,
    rid: originSticker.rid
  });
  await originSticker.update({$inc: {hits: 1}});
  await sticker.save();
  return sticker;
};

module.exports = mongoose.model("stickers", schema);