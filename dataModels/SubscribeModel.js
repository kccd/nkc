// 用户的关注，分为：关注的用户、关注的专业、关注的文章

const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const redisClient = require('../settings/redisClient');

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
* 获取用户关注的所有用户的ID
* @param {String} uid 用户ID
* @return {[String]} 用户ID数组
* @author pengxiguaa 2019-4-28
* @author pengxiguaa 2019-7-31
* */
schema.statics.getUserSubUsersId = async (uid) => {
  let subscribeUsersId = await redisClient.smembersAsync(`user:${uid}:subscribeUsersId`);
  if(!subscribeUsersId.length) {
    const SubscribeModel = mongoose.model("subscribes");
    subscribeUsersId = await SubscribeModel.saveUserSubUsersId(uid);
  }
  return subscribeUsersId;
};
/*
* 将用户关注的所有用户ID存入redis
* @param {String} uid 用户ID
* @return {[String]} 用户ID数组
* @author pengxiguaa 2019-7-31
* */
schema.statics.saveUserSubUsersId = async (uid) => {
  const SubscribeModel = mongoose.model("subscribes");
  const sub = await SubscribeModel.find({
    type: "user",
    uid
  }, {tUid: 1}).sort({toc: -1});
  const usersId = sub.map(s => s.tUid);
  setImmediate(async () => {
    await redisClient.delAsync(`user:${uid}:subscribeUsersId`);
    if(usersId.length) {
      await redisClient.saddAsync(`user:${uid}:subscribeUsersId`, usersId);
    }
    await mongoose.model("subscribes").saveUserSubscribeTypesToRedis(uid);
  });
  return usersId;
};
/*
* 获取用户的粉丝ID
* @param {String} uid 用户ID
* @return {[String]} 用户ID数组
* @author pengxiguaa 2019-11-18
* */
schema.statics.getUserFansId = async (uid) => {
  let subscribeUsersId = await redisClient.smembersAsync(`user:${uid}:fansId`);
  if(!subscribeUsersId.length) {
    const SubscribeModel = mongoose.model("subscribes");
    subscribeUsersId = await SubscribeModel.saveUserFansId(uid);
  }
  return subscribeUsersId;
};
/*
* 将用户的粉丝ID存入redis
* @param {String} uid 用户ID
* @return {[String]} 用户ID数组
* @author pengxiguaa 2019-11-18
*/
schema.statics.saveUserFansId = async (uid) => {
  const SubscribeModel = mongoose.model("subscribes");
  const sub = await SubscribeModel.find({
    type: "user",
    tUid: uid
  }, {uid: 1}).sort({toc: -1});
  const usersId = sub.map(s => s.uid);
  setImmediate(async () => {
    await redisClient.delAsync(`user:${uid}:fansId`);
    if(usersId.length) {
      await redisClient.saddAsync(`user:${uid}:fansId`, usersId);
    }
    await mongoose.model("subscribes").saveUserSubscribeTypesToRedis(uid);
  });
  return usersId;
};
/*
* 获取用户关注的专业ID
* @param {String} uid 用户ID
* @param {String} type 专业类型，为空时返回全部专业，topic: 仅返回话题，discipline: 仅返回学科
* @author pengxiguaa 2019-7-19
* @return {[String]} 专业ID数组
* */
schema.statics.getUserSubForumsId = async (uid, type) => {
  let forumsId = await redisClient.smembersAsync(`user:${uid}:subscribeForumsId`);
  if(!forumsId.length) {
    const SubscribeModel = mongoose.model("subscribes");
    forumsId = await SubscribeModel.saveUserSubForumsId(uid);
  }
  if(["topic", "discipline"].includes(type)) {
    const forums = await mongoose.model("forums").find({forumType: type}, {fid: 1});
    const forumsIdFilter = forums.map(f => f.fid);
    forumsId = forumsId.filter(fid => forumsIdFilter.includes(fid));
  }
  return forumsId;
};
/*
* 将用户关注的专业ID存入redis
* @param {String} uid 用户ID
* @author pengxiguaa 2019-7-31
* */
schema.statics.saveUserSubForumsId = async (uid) => {
  const subs = await mongoose.model("subscribes").find({
    type: "forum",
    uid
  }, {fid: 1}).sort({toc: -1});
  const forumsId = subs.map(s => s.fid);
  setImmediate(async () => {
    await redisClient.delAsync(`user:${uid}:subscribeForumsId`);
    if(forumsId.length) {
      await redisClient.saddAsync(`user:${uid}:subscribeForumsId`, forumsId);
    }
    await mongoose.model("subscribes").saveUserSubscribeTypesToRedis(uid);
  });
  return forumsId;
};
/*
* 获取用户关注的专栏ID
* @param {String} uid 用户ID
* @author pengxiguaa 2019-7-19
* @return {[Number]} 专栏ID数组
* */
schema.statics.getUserSubColumnsId = async (uid) => {
  let columnsId = await redisClient.smembersAsync(`user:${uid}:subscribeColumnsId`);
  if(!columnsId.length) {
    const SubscribeModel = mongoose.model("subscribes");
    columnsId = await SubscribeModel.saveUserSubColumnsId(uid);
  }
  return columnsId.map(id => Number(id));
};
/*
* 将用户关注的专栏ID存入redis
* @param {String} uid 用户ID
* @author pengxiguaa 2019-7-31
* @return {[Number]} 专栏ID数组
* */
schema.statics.saveUserSubColumnsId = async (uid) => {
  const subs = await mongoose.model("subscribes").find({
    type: "column",
    uid
  }, {columnId: 1}).sort({toc: -1});
  const columnsId = subs.map(s => s.columnId);
  setImmediate(async () => {
    await redisClient.delAsync(`user:${uid}:subscribeColumnsId`);
    if(columnsId.length) {
      await redisClient.saddAsync(`user:${uid}:subscribeColumnsId`, columnsId);
    }
    await mongoose.model("subscribes").saveUserSubscribeTypesToRedis(uid);
  });
  return columnsId;
};
/*
* 获取用户关注的文章ID
* @param {String} uid 用户ID
* @author pengxiguaa 2019-7-19
* @return {[String]} 文章ID数组
* */
schema.statics.getUserSubThreadsId = async (uid, detail) => {
  let key = `user:${uid}:subscribeThreadsId`;
  if(["sub", "replay"].includes(detail)) {
    key += `:${detail}`;
  }
  let threadsId = await redisClient.smembersAsync(key);
  if(!threadsId.length) {
    threadsId = await mongoose.model("subscribes").saveUserSubThreadsId(uid, detail);
  }
  return threadsId;
};
/*
* 将用户关注的文章ID存入redis
* @param {String} uid 用户ID
* @return {[String]} 文章ID数组
* @author pengxiguaa 2019-7-31
* */

schema.statics.saveUserSubThreadsId = async (uid, detail) => {
  const total = [], reply = [], sub = [];
  const subs = await mongoose.model("subscribes").find({
    type: "thread",
    uid
  }, {tid: 1, detail: 1}).sort({toc: -1});
  subs.map(s => {
    total.push(s.tid);
    if(s.detail === "replay") {
      reply.push(s.tid);
    } else if(s.detail === "sub") {
      sub.push(s.tid);
    }
  });
  setImmediate(async () => {
    let key = `user:${uid}:subscribeThreadsId`;
    await redisClient.delAsync(key);
    if(total.length) {
      await redisClient.saddAsync(key, total);
    }
    key = `user:${uid}:subscribeThreadsId:replay`;
    await redisClient.delAsync(key);
    if(reply.length) {
      await redisClient.saddAsync(key, reply);
    }
    key = `user:${uid}:subscribeThreadsId:sub`;
    await redisClient.delAsync(key);
    if(sub.length) {
      await redisClient.saddAsync(key, sub);
    }
    await mongoose.model("subscribes").saveUserSubscribeTypesToRedis(uid);
  });
  if(detail === "replay") {
    return reply;
  } else if(detail === "sub") {
    return sub;
  } else {
    return total;
  }
};

/*
* 获取用户收藏的文章ID
* @param {String} uid 用户ID
* @author pengxiguaa 2019-7-19
* @return {[String]} 文章ID数组
* */
schema.statics.getUserCollectionThreadsId = async (uid) => {
  let threadsId = await redisClient.smembersAsync(`user:${uid}:collectionThreadsId`);
  if(!threadsId.length) {
    threadsId = await mongoose.model("subscribes").saveUserCollectionThreadsId(uid);
  }
  return threadsId;
};
schema.statics.saveUserCollectionThreadsId = async (uid) => {
  const subs = await mongoose.model("subscribes").find({
    type: "collection",
    uid
  }, {tid: 1}).sort({toc: -1});
  const threadsId = subs.map(s => s.tid);
  setImmediate(async () => {
    await redisClient.delAsync(`user:${uid}:collectionThreadsId`);
    if(threadsId.length) {
      await redisClient.saddAsync(`user:${uid}:collectionThreadsId`, threadsId);
    }
    await mongoose.model("subscribes").saveUserSubscribeTypesToRedis(uid);
  });
  return threadsId;
};

/*
* 将用户的关注分类存入redis
* @param {String} uid 用户ID
* @return {Object} redis集合
*   "user:uid:subscribeType:typeId:thread": [tid, tid, ...]
* @author pengxiguaa 2019-8-1
* */
/*schema.statics.saveUserSubscribeTypesSingleSubTypeToRedis = async (uid, subType) => {
  const tt = Date.now();
  const SubscribeModel = mongoose.model("subscribes");
  const types = await SubscribeModel.find({uid}, {_id: 1});
  const typesId = types.map(t => t._id);
  typesId.push("all");
  typesId.push("other");
  await Promise.all(typesId.map(async id => {
    await SubscribeModel.saveUserSubscribeTypeToRedis(uid, id, subType);
  }));
  console.log(Date.now() - tt, "ms 更新缓存耗时");
};
schema.statics.saveUserSubscribeTypeToRedis = async (uid, typeId, subType) => {
  const SubscribeTypeModel = mongoose.model("subscribeTypes");
  const SubscribeModel = mongoose.model("subscribes");
  const ForumModel = mongoose.model("forums");
  const defaultTypes = ["thread", "topic", "discipline", "user", "column", "collection"];
  if(!defaultTypes.includes(subType)) return [];
  const match = {uid};
  if(typeId === "all") {

  } else if(typeId === "other") {
    match.cid = [];
  } else {
    const subscribeType = await SubscribeTypeModel.findOne({typeId, uid});
    if(!subscribeType) return [];
    match.cid = typeId;
  }
  let subKey;
  if(subType === "thread") {
    match.type = "thread";
    subKey = "tid";
  } else if(subType === "user") {
    match.type = "user";
    subKey = "tUid";
  } else if(subType === "column") {
    match.type = "column";
    subKey = "columnId";
  } else if(subType === "topic") {
    const topicsId = await ForumModel.getForumsIdFromRedis("topic");
    match.type = "forum";
    match.fid = {$in: topicsId};
    subKey = "fid";
  } else if(subType === "discipline") {
    const disciplinesId = await ForumModel.getForumsIdFromRedis("discipline");
    match.type = "forum";
    match.fid = {$in: disciplinesId};
    subKey = "fid";
  } else if(subType === "collection") {
    match.type = "collection";
    subKey = "tid";
  } else {
    return [];
  }

  const subs = await SubscribeModel.find(match, {
    tUid: 1,
    fid: 1,
    tid: 1,
    columnId: 1
  });
  const ids = subs.map(s => s[subKey]);
  const key = `user:${uid}:subscribeType:${typeId}:${subType}`;
  setImmediate(async () => {
    await redisClient.delAsync(key);
    if(ids.length) {
      await redisClient.saddAsync(key, ids);
    }
  });
  return ids;
};*/
schema.statics.getUserSubscribeTypesResults = async (uid) => {
  const SubscribeTypeModel = mongoose.model("subscribeTypes");
  const SubscribeModel = mongoose.model("subscribes");
  const ForumModel = mongoose.model("forums");
  const defaultTypes = ["thread", "topic", "discipline", "user", "column", "collection"];
  const subscribeTypes = await SubscribeTypeModel.find({uid}, {_id: 1});
  const newSubscribeTypes = subscribeTypes.map(s => s._id);
  newSubscribeTypes.push("all");
  newSubscribeTypes.push("other");
  const topicsId = await ForumModel.getForumsIdFromRedis("topic");
  const disciplinesId = await ForumModel.getForumsIdFromRedis("discipline");
  const results = {};
  for(const defaultType of defaultTypes) {
    for(const t of newSubscribeTypes) {
      const match = {
        uid
      };
      if(t === "all") {

      } else if(t === "other") {
        match.cid = [];
      } else {
        match.cid = t;
      }
      if(defaultType === "thread") {
        match.type = "thread";
      } else if(defaultType === "user") {
        match.type = "user";
      } else if(defaultType === "column") {
        match.type = "column";
      } else if(defaultType === "collection") {
        match.type = "collection";
      } else if(defaultType === "topic") {
        match.type = "forum";
        match.fid = {$in: topicsId};
      } else if(defaultType === "discipline") {
        match.type = "forum";
        match.fid = {$in: disciplinesId};
      }
      const key = `user:${uid}:subscribeType:${t}:${defaultType}`;
      const sub = await SubscribeModel.find(match, {
        tid: 1,
        uid: 1,
        tUid: 1,
        columnId: 1,
        fid: 1,
        cid: 1
      }).sort({toc: -1});

      if(defaultType === "thread") {
        results[key] = sub.map(s => s.tid);
      } else if(defaultType === "user") {
        results[key] = sub.map(s => s.tUid);
      } else if(defaultType === "collection") {
        results[key] = sub.map(s => s.tid);
      } else if(defaultType === "topic") {
        results[key] = sub.map(s => s.fid);
      } else if(defaultType === "discipline") {
        results[key] = sub.map(s => s.fid);
      } else if(defaultType === "column") {
        results[key] = sub.map(s => s.columnId);
      }
    }
  }
  return {
    results,
    defaultTypes,
    newSubscribeTypes
  };
};
schema.statics.saveUserSubscribeTypesToRedis = async (uid, data) => {
  setImmediate(async () => {
    if(!data) {
      data = await mongoose.model("subscribes").getUserSubscribeTypesResults(uid);
    }
    const {results, defaultTypes, newSubscribeTypes} = data;
    const typeKey = `user:${uid}:subscribeTypesId`;
    // 清除旧键
    const oldSubscribeTypesId = await redisClient.smembersAsync(typeKey);
    for(const key of oldSubscribeTypesId) {
      for(const defaultType of defaultTypes) {
        await redisClient.delAsync(`user:${uid}:subscribeType:${key}:${defaultType}`);
      }
    }
    // 存入新键
    await redisClient.saddAsync(typeKey, newSubscribeTypes);
    for(const key in results) {
      if(!results.hasOwnProperty(key)) continue;
      if(results[key].length) {
        await redisClient.saddAsync(key, results[key]);
      }
    }
  });
};
/*
* 从redis中读取用户关注分类，如1分类中的所有文章ID
* @param {String} uid 用户ID
* @param {String/Number} "all": 全部, "other": 未分类, number: 具体的自定义分类ID
* @param {String} subType 关注类型 thread: 文章, user: 用户, topic: 话题, discipline: 学科, collection: 收藏, column: 专栏
* @return {[String/Number]} 专栏ID类型为Number, 其余ID类型为String，返回的是一个用ID组成的数组。
* @author pengxiguaa 2019-8-1
* */
schema.statics.getUserSubscribeTypeFromRedis = async (uid, typeId, subType) => {
  const SubscribeModel = mongoose.model("subscribes");
  const key = `user:${uid}:subscribeType:${typeId}:${subType}`;
  let ids = await redisClient.smembersAsync(key);
  if(!ids.length) {
    const typesId = await redisClient.smembersAsync(`user:${uid}:subscribeTypesId`);
    if(!typesId.includes(typeId)) {
      const data = await SubscribeModel.getUserSubscribeTypesResults(uid);
      ids = data.results[key];
      await SubscribeModel.saveUserSubscribeTypesToRedis(uid, data);
    }
  }
  return ids;
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
      });
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
  let users = await UserModel.find({uid: {$in: [...uid]}});
  users = await UserModel.extendUsersInfo(users);
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
  return;
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
  let sub = await SubscribeModel.findOne({uid, tid, type: "thread", detail: type});
  if(sub) return;
  sub = SubscribeModel({
    _id: await mongoose.model("settings").operateSystemID("subscribes", 1),
    type: "thread",
    detail: type,
    uid,
    tid
  });
  await sub.save();
};

module.exports = mongoose.model('subscribes', schema);
