const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const serverConfig = require('../config/server.json');
const alipay2 = require('../nkcModules/alipay2');
const kcbsRecordSchema = new Schema({
  _id: Number,
  // 花费科创币用户的ID
  from: {
    type: String,
    required: true,
    index: 1
  },
  // 获得科创币用户的ID
  to: {
    type: String,
    required: true,
    index: 1
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 积分类型
  scoreType: {
    type: String,
    required: true,
    index: 1,
  },
  // 手续费
  fee: {
    type: Number,
    default: 0,
    index: 1,
  },
  // 交易类型
  type: {
    type: String,
    required: true,
    index: 1
  },
  // 转账金额
  num: {
    type: Number,
    required: true,
    index: 1
  },
  // 实际付款金额（元，含手续费）
  payment: {
    type: Number,
    default: null,
  },
  // 备注
  description: {
    type: String,
    default: ''
  },
  // 隐藏备注
  hideDescription: {
    type: Boolean,
    default: false
  },
  ip: {
    type: String,
    default: '0.0.0.0',
    index: 1
  },
  port: {
    type: String,
    default: '0',
  },
  pid: {
    type: String,
    default: '',
    index: 1
  },
  tid: {
    type: String,
    default: '',
    index: 1
  },
  tUid: {
    type: String,
    default: '',
    index: 1
  },
  problemId: {
    type: String,
    default: '',
    index: 1
  },
  ordersId: {
    type: [String]
  },
  shareToken: {
    type: String,
    default: "",
    index: 1
  },
  verify: {
    type: Boolean,
    index: 1,
    default: true,
  },
  error: {
    type: String,
    default: ''
  },
  c: {
    type: Schema.Types.Mixed,
    default: {}
  }
  /*
  * c: {
  *  alipayAccount: String,
  *  alipayName: String,
  *  alipayFee: Number,
  *  alipayInterface: Boolean  // 调用阿里接口是否成功 null: 未知，false: 失败， true: 成功
  * }
  * */
}, {
  collection: 'kcbsRecords',
  toObject: {
    getters: true,
    virtuals: true
  }
});

kcbsRecordSchema.virtual('fromUser')
  .get(function() {
    return this._fromUser;
  })
  .set(function(p) {
    this._fromUser = p;
  });

// 与银行间的交易记录
kcbsRecordSchema.statics.insertSystemRecord = async (type, u, ctx, additionalReward) => {
  additionalReward = additionalReward || 0;
  const UserModel = mongoose.model("users");
  const {nkcModules, address, port, data, db} = ctx;
  const {user} = data;
  if(!user || !u) return;
  // 加载相应科创币设置
  const kcbsType = await db.KcbsTypeModel.findOnly({_id: type});
  // 如果是撤销操作则扣除额外的奖励
  kcbsType.num -= additionalReward;
  if(kcbsType.count === 0) {
    // 此操作未启动
    return;
  } else if(kcbsType.count !== -1) {
    // 获取今日已触发该操作的次数
    const today = nkcModules.apiFunction.today();
    const recordsCount = await db.KcbsRecordModel.count({
      type,
      $or: [
        {
          from: u.uid,
          to: 'bank'
        },
        {
          from: 'bank',
          to: u.uid
        }
      ],
      toc: {$gte: today}
    });
    // 若次数已达上限则不做任何处理
    if(recordsCount >= kcbsType.count) return;
  }
  // 若kcbsType === -1则不限次数
  const _id = await db.SettingModel.operateSystemID('kcbsRecords', 1);
  const newRecords = db.KcbsRecordModel({
    _id,
    from: 'bank',
    to: u.uid,
    type,
    num: kcbsType.num,
    ip: address,
    port
  });
  // 若该操作科创币为负，则由用户转给银行
  if(kcbsType.num < 0) {
    newRecords.from = u.uid;
    newRecords.to = 'bank';
    newRecords.num = -1*newRecords.num;
  }
  if(data.targetUser) {
    if(data.user !== u) {
      newRecords.tUid = data.user.uid;
    } else {
      newRecords.tUid = data.targetUser.uid;
    }
  }
  let thread, post;
  if(data.thread) {
    thread = data.thread;
  } else if (data.targetThread) {
    thread = data.targetThread;
  }
  if(data.post) {
    post = data.post;
  } else if (data.targetPost) {
    post = data.targetPost;
  }
  if(thread) {
    newRecords.tid = thread.tid;
    newRecords.fid = thread.fid;
  }
  if(post) {
    newRecords.pid = post.pid;
    newRecords.fid = post.fid;
    newRecords.tid = post.tid;
  }
  if(data.problem) newRecords.problemId = data.problem._id;
  // 写入交易记录，紧接着更新用户的kcb数据
  await newRecords.save();
  u.kcb = await UserModel.updateUserKcb(u.uid);
};

// 用户间转账记录
kcbsRecordSchema.statics.insertUsersRecord = async (options) => {
  const KcbsRecordModel = mongoose.model('kcbsRecords');
  const UserModel = mongoose.model("users");
  const SettingModel = mongoose.model('settings');
  const {
    fromUser, toUser, num, description, post, ip, port
  } = options;
  if(fromUser.uid === toUser.uid) throwErr(400, "无法对自己执行此操作");
  const _id = await SettingModel.operateSystemID('kcbsRecords', 1);
  const record = KcbsRecordModel({
    _id,
    from: fromUser.uid,
    to: toUser.uid,
    num,
    description,
    pid: post.pid,
    ip,
    port,
    type: 'creditKcb'
  });
  await record.save();
  fromUser.kcb = await UserModel.updateUserKcb(fromUser.uid);
  toUser.kcb = await UserModel.updateUserKcb(toUser.uid);
};


kcbsRecordSchema.statics.extendKcbsRecords = async (records) => {
  const UserModel = mongoose.model('users');
  const ThreadModel = mongoose.model('threads');
  const PostModel = mongoose.model('posts');
  const ForumModel = mongoose.model('forums');
  const KcbsTypeModel = mongoose.model('kcbsTypes');
  const SettingModel = mongoose.model('settings');
  const scoreTypes = await SettingModel.getScores();
  const scoreTypesObj = {};
  scoreTypes.map(s => {
    scoreTypesObj[s.type] = s.name;
  });
  const uid = new Set(), pid = new Set(), tid = new Set(), fid = new Set(), kcbsTypesId = new Set();
  for(const r of records) {
    if(r.from !== 'bank') {
      uid.add(r.from);
    }
    if(r.to !== 'bank') {
      uid.add(r.to);
    }
    if(r.pid) pid.add(r.pid);
    if(r.tid) tid.add(r.tid);
    if(r.fid) fid.add(r.fid);
    if(r.tUid) uid.add(r.tUid);
    kcbsTypesId.add(r.type);
  }
  const usersObj = {}, threadsObj = {}, forumsObj = {}, postsObj = {}, typesObj = {};
  const users = await UserModel.find({uid: {$in: [...uid]}});
  const threads = await ThreadModel.find({tid: {$in: [...tid]}});
  const forums = await ForumModel.find({fid: {$in: [...fid]}});
  const posts = await PostModel.find({pid: {$in: [...pid]}});
  const types = await KcbsTypeModel.find({_id: {$in: [...kcbsTypesId]}});
  for(const t of types) {
    typesObj[t._id] = t;
  }
  for(const user of users) {
    usersObj[user.uid] = user;
  }
  for(const forum of forums) {
    forumsObj[forum.fid] = forum;
  }
  for(const thread of threads) {
    threadsObj[thread.fid] = thread;
  }
  for(let post of posts) {
    post = post.toObject();
    post.url = await PostModel.getUrl(post);
    postsObj[post.pid] = post;
  }
  return records.map(r => {
    r = r.toObject();
    if(r.tUid) r.targetUser = usersObj[r.tUid];
    if(r.from !== 'bank') {
      r.fromUser = usersObj[r.from];
    }
    if(r.to !== 'bank') {
      r.toUser = usersObj[r.to];
    }
    if(r.tid) r.thread = threadsObj[r.tid];
    if(r.fid) r.forum = forumsObj[r.fid];
    if(r.pid) {
      r.post = postsObj[r.pid];
    }
    r.scoreName = scoreTypesObj[r.scoreType];
    r.kcbsType = typesObj[r.type];
    return r
  });
};

/*
  获取支付宝链接，去充值或付款。付款时需传递参数options.type = 'pay'
  @param options
    uid: 充值用户、付款用户
    money: 金额，分
    ip: 操作人IP地址,
    port: 操作人端口，
    title: 账单标题, 例如：科创币充值
    notes: 账单说明，例如：充值23个科创币
    backParams: 携带的参数，会原样返回
  @return url: 返回链接
  @author pengxiguaa 2019/3/13
*/
kcbsRecordSchema.statics.getAlipayUrl = async (options) => {
  let {uid, money, ip, port, title, notes, backParams, score, fee} = options;
  const KcbsRecordModel = mongoose.model('kcbsRecords');
  const SettingModel = mongoose.model('settings');
  money = Number(money);
  if(money > 0) {}
  else {
    throwErr(400, '金额必须大于0');
  }
  const mainScore = await SettingModel.getMainScore();
  const kcbsRecordId = await SettingModel.operateSystemID('kcbsRecords', 1);
  const record = KcbsRecordModel({
    _id: kcbsRecordId,
    scoreType: mainScore.type,
    from: 'bank',
    to: uid,
    type: 'recharge',
    fee,
    num: score,
    payment: money,
    ip,
    port,
    verify: false,
    description: notes
  });
  await record.save();
  const o = {
    money,
    id: kcbsRecordId,
    title,
    notes,
    backParams,
    returnUrl: serverConfig.domain + '/account/finance/recharge?type=back'
  };
  return await alipay2.receipt(o);
};

kcbsRecordSchema.statics.hideSecretInfo = async (records) => {
  for(const record of records) {
    record.c = "";
    if(record.hideDescription) record.description = "【鼓励理由不符合论坛相关规定，已隐藏】";
  }
};

module.exports = mongoose.model('kcbsRecords', kcbsRecordSchema);
