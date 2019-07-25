// 用户的关注，分为：关注的用户、关注的专业、关注的文章

const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;

const schema = new Schema({
  _id: Number,
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 类型
  // 1. thread 关注的文章
  // 2. forum 关注的专业
  // 3. user 关注的用户
  // 4. column 订阅的专栏
  // 5. collection 收藏的文章
  type: {
    type: String,
    required: true,
    index: 1
  },
  // 详细类型
  // thread类型 sub: 关注的文章, replay: 回复过的文章 （post: 自己发表的文章）
  detail: {
    type: String,
    default: "",
    index: 1
  },
  // 关注的发起人
  uid: {
    type: String,
    required: true,
    index: 1
  },
  // 若为关注用户，此字段表示关注的人ID
  tUid: {
    type: String,
    default: "",
    index: 1
  },
  // 专栏ID
  columnId: {
    type: Number,
    default: null,
    index: 1
  },
  // 关注的专业ID
  fid: {
    type: String,
    default: "",
    index: 1
  },
  // 关注的文章ID
  tid: {
    type: String,
    default: "",
    index: 1
  },
  // 关注分类ID
  cid: {
    type: [Number],
    default: [],
    index: 1
  }
}, {
  collection: "subscribes"
});
/*
* 获取用户专注的所有用户的ID
* @param {String} uid 用户ID
* @author pengxiguaa 2019-4-28
* */
schema.statics.getUserSubUsersId = async (uid) => {
  const SubscribeModel = mongoose.model("subscribes");
  const sub = await SubscribeModel.find({
    type: 'user',
    uid
  }, {tUid: 1});
  return sub.map(s => s.tUid);
};
/*
* 获取用户关注的专业ID
* @param {String} uid 用户ID
* @author pengxiguaa 2019-7-19
* @return {[String]} 专业ID数组
* */
schema.statics.getUserSubForumsId = async (uid) => {
  const subs = await mongoose.model("subscribes").find({
    type: "forum",
    uid
  });
  return subs.map(s => s.fid);
};
/*
* 获取用户关注的专栏ID
* @param {String} uid 用户ID
* @author pengxiguaa 2019-7-19
* @return {[Number]} 专栏ID数组
* */
schema.statics.getUserSubColumnsId = async (uid) => {
  const subs = await mongoose.model("subscribes").find({
    type: "column",
    uid
  });
  return subs.map(s => s.columnId);
};
/*
* 获取用户关注的文章ID
* @param {String} uid 用户ID
* @author pengxiguaa 2019-7-19
* @return {[String]} 文章ID数组
* */
schema.statics.getUserSubThreadsId = async (uid) => {
  const subs = await mongoose.model("subscribes").find({
    type: "thread",
    uid
  }, {tid: 1});
  return subs.map(s => s.tid);
};
/*
* 获取用户收藏的文章ID
* @param {String} uid 用户ID
* @author pengxiguaa 2019-7-19
* @return {[String]} 文章ID数组
* */
schema.statics.getUserCollectionThreadsId = async (uid) => {
  const subs = await mongoose.model("subscribes").find({
    type: "collection",
    uid
  });
  return subs.map(s => s.tid);
};

/**
 * -------
 * 关注专业
 * -------
 * @param {Object} options 
 * @参数说明 options对象中必要参数
 * | uid   --  用户ID
 * | fids  --  目标专业的fid数组集合，不可为空
 * | 其余未作说明的参数为非必要
 * 
 * @return 无返回
 * 
 * @author Kris 2019-06-10
 */
schema.statics.autoAttentionForum = async function(options) {
  const {uid, fids} = options
  if(!uid) throwErr(400, "该操作uid不可为空")
  let SubscribeModel = mongoose.model("subscribes");
  let SettingModel = mongoose.model("settings");
  for(let scr of fids) {
    let subscribeForum = await SubscribeModel.findOne({type: "forum", fid: scr, uid: uid});
    if(!subscribeForum) {
      const sid = await SettingModel.operateSystemID('subscribes', 1);
      let newSubscribeForum = new SubscribeModel({
        _id: sid,
        uid: uid,
        type: "forum",
        fid: scr
      })
      await newSubscribeForum.save();
    }
  }
};

schema.statics.extendSubscribes = async (subscribes) => {
  const UserModel = mongoose.model("users");
  const ForumModel = mongoose.model("forums");
  const ColumnModel = mongoose.model("columns");
  const ThreadModel = mongoose.model("threads");
  const uid = new Set(), fid = new Set(), columnId = new Set(), tid = new Set();
  subscribes.map(s => {
    const {type} = s;
    if(type === "user") {
      uid.add(s.uid);
      uid.add(s.tUid);
    } else if(type === "thread") {
      tid.add(s.tid);
    } else if(type === "forum") {
      fid.add(s.fid);
    } else if(type === "column") {
      columnId.add(s.columnId);
    } else if(type === "collection") {
      tid.add(s.tid)
    }
  });
  const users = await UserModel.find({uid: {$in: [...uid]}});
  const usersObj = {};
  users.map(u => {
    usersObj[u.uid] = u;
  });
  let threads = await ThreadModel.find({tid: {$in: [...tid]}});
  threads = await ThreadModel.extendThreads(threads, {
    htmlToText: true
  });
  const threadsObj = {};
  threads.map(t => {
    threadsObj[t.tid] = t;
  });
  const columns = await ColumnModel.find({_id: {$in: [...columnId]}});
  const columnsObj = {};
  columns.map(c => {
    columnsObj[c._id] = c;
  });
  const forums = await ForumModel.find({fid: {$in: [...fid]}});
  const forumsObj = {};
  forums.map(f => {
    forumsObj[f.fid] = f;
  });
  const results = [];
  for(const s of subscribes) {
    const subscribe = s.toObject();
    const {type, uid, tUid, tid, fid, columnId} = subscribe;
    if(type === "user") {
      subscribe.user = usersObj[uid];
      subscribe.targetUser = usersObj[tUid];
      if(!subscribe.targetUser) {
        continue;
      }
    } else if(type === "forum") {
      subscribe.forum = forumsObj[fid];
      if(!subscribe.forum) {
        continue;
      }
    } else if(type === "column") {
      subscribe.column = columnsObj[columnId];
      if(!subscribe.column) {
        continue;
      }
    } else if(type === "collection") {
      subscribe.thread = threadsObj[tid];
      if(!subscribe.thread) {
        continue;
      }
    } else if(type === "thread") {
      subscribe.thread = threadsObj[tid];
      if(!subscribe.thread) {
        continue;
      }
    }
    results.push(subscribe);
  }
  return results;
};
/*
* 创建默认关注分类
* @param {String} type post: 我发表的, replay: 我参与的
* @param {String} uid 用户ID
* @author pengxiguaa 2019-7-25
* */
schema.statics.createDefaultType = async (type, uid) => {
  const SubscribeTypeModel = mongoose.model("subscribeTypes");
  let sub = await SubscribeTypeModel.findOne({uid, type});
  if(!sub) {
    sub = {
      _id: await mongoose.model("settings").operateSystemID("subscribeTypes", 1),
      uid
    };
    if(type === "post") {
      sub.type = type;
      sub.name = "我发表的";
    } else {
      sub.type = type;
      sub.name = "我参与的";
    }
    sub = SubscribeTypeModel(sub);
    await sub.save();
  }
  return sub;
};
/*
* 发表文章之后，向关注表插入一条数据。我发表的
* */
schema.statics.insertSubscribe = async (type, uid, tid) => {
  const SubscribeModel = mongoose.model("subscribes");
  const SubscribeTypeModel = mongoose.model("subscribeTypes");
  let subType = await SubscribeTypeModel.findOne({uid, type});
  if(!subType) subType = await SubscribeTypeModel.createDefaultType(type, uid);
  let sub = await SubscribeModel.findOne({uid, tid, type: "thread"});
  if(sub) return;
  sub = SubscribeModel({
    _id: await mongoose.model("settings").operateSystemID("subscribes", 1),
    type: "thread",
    detail: type,
    uid,
    tid,
    cid: [subType._id]
  });
  await sub.save();
  await SubscribeTypeModel.updateCount([subType._id]);
};
module.exports = mongoose.model('subscribes', schema);