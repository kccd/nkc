const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/*
* 上层引用类型
* */
const voteSources = {
  post: 'post',
  article: 'article',
  moment: 'moment',
  comment: 'comment',
};


const voteTypes = {
  up: 'up', // 点赞
  down: 'down' // 点踩
};

const postsVoteSchema = new Schema({
  // 上层引用
  source: {
    type: String,
    required: true,
    index: 1
  },
  // 上层引用ID
  sid: {
    type: String,
    required: true,
    index: 1
  },
  // 点赞、点踩的人的ID
  uid: {
    type: String,
    index: 1,
    required: true
  },
  // 点赞时间
  toc: {
    type: Date,
    index: 1,
    default: Date.now
  },
  // 最后修改时间
  tlm: {
    type: Date,
    index: 1,
    default: Date.now
  },
  // 废弃
  pid: {
    type: String,
    index: 1,
    default: ''
  },
  // 被点赞、点踩的人的ID
  tUid: {
    type: String,
    index: 1,
    required: true
  },
  // 类型 up(点赞), down(点踩)
  type: {
    type: String, // up, down
    index: 1,
    required: true,
  },
  // 权重 普通用户：1， 学者：2，  专家：5
  // 当前点赞、点踩所影响的分值
  num: {
    type: Number,
    default: 1
  }
}, {
  collection: 'postsVotes'
});

/*
* 获取引用类型
* */
postsVoteSchema.statics.getVoteSources = async () => {
  return voteSources;
};

/*
* 获取点赞类型
* */
postsVoteSchema.statics.getVoteTypes = async () => {
  return voteTypes;
};

/*
* 检测点赞类型
* */
postsVoteSchema.statics.checkVoteType = async (voteType) => {
  const types = Object.values(voteTypes);
  if(!types.includes(voteType)) {
    throwErr(400, `voteType error. voteType=${voteType}`);
  }
}

/*
* 取消点赞
* @param {Object}
*   @param {String} source 点赞上层引用 参考 voteSources
*   @param {String} sid 上层引用ID
*   @param {String} voteType 参考 voteTypes
*   @param {String} uid 点赞者
*   @param {String} tUid 被点赞者
* */
postsVoteSchema.statics.cancelVote = async (props) => {
  const PostsVoteModel = mongoose.model('postsVotes');
  const {
    source,
    sid,
    uid,
    voteType,
    tUid
  } = props;
  await PostsVoteModel.checkVoteType(voteType);
  const vote = await PostsVoteModel.findOne({
    source,
    sid,
    uid,
    type: voteType,
    tUid
  });
  if(vote) {
    await vote.deleteOne();
  }
};

/*
* 添加点赞
* @param {Object}
*   @param {String} source 点赞上层引用 参考 voteSources
*   @param {String} sid 上层引用ID
*   @param {String} voteType 参考 voteTypes
*   @param {String} uid 点赞者
*   @param {String} tUid 被点赞者
* */
postsVoteSchema.statics.addVote = async (props) => {
  const {
    source,
    sid,
    voteType,
    uid,
    tUid
  } = props;

  const PostsVoteModel = mongoose.model('postsVotes');
  await PostsVoteModel.checkVoteType(voteType);

  const votes = await PostsVoteModel.find({
    source,
    sid,
    uid
  });

  const votesData = {
    up: {
      self: null,
      alien: null,
    },
    down: {
      self: null,
      alien: null
    }
  };

  for(const vote of votes) {
    if(vote.type === 'up') {
      votesData.up.self = vote;
      votesData.down.alien = vote;
    } else {
      votesData.down.self = vote;
      votesData.up.alien = vote;
    }
  }

  const {self, alien} = votesData[voteType];

  if(alien) {
    await alien.deleteOne();
  }

  if(!self) {
    const vote = PostsVoteModel({
      source,
      sid,
      uid,
      tUid,
      type: voteType,
      num: 1
    });
    await vote.save();
  }
}

/*
* 获取总点赞或点踩数
* @param {String} source 上层引用 参考 voteSources
* @param {String} 上层引用ID
* @param {String} voteType 点赞或点踩 参考 voteTypes
* @return {Number}
* */
postsVoteSchema.statics.getTotalVote = async (source, sid, voteType) => {
  const PostsVoteModel = mongoose.model('postsVotes');
  let voteCount = await PostsVoteModel.aggregate([
    {
      $match: {
        source,
        sid,
        type: voteType
      }
    },
    {
      $group: {
        _id: "$sid",
        count: {$sum: "$num"}
      }
    }
  ]);
  return voteCount.length === 0? 0: voteCount[0].count;
};

/*
* 指定引用、用户，获取用户已点赞类型
* @param {String} source 上层引用类型 参考 voteSources
* @param {[String]} sourcesId 上层引用对用的ID组成的数组
* @param {String} 点赞或点踩用户ID
* @return {Object} 键为sid，值为此用户的点赞类型 up(点赞), down(点踩), 空字符串(未点赞点踩)
* */
postsVoteSchema.statics.getVotesTypeBySource = async (source, sourcesId = [], uid) => {
  const PostsVoteModel = mongoose.model('postsVotes');
  let votes = [];
  if(uid) {
    votes = await PostsVoteModel.find({
      source,
      sid: {$in: sourcesId},
      uid,
    }, {
      sid: 1,
      type: 1,
    });
  }
  const votesObj = {};
  for(const vote of votes) {
    votesObj[vote.sid] = vote.type;
  }
  const results = {};
  for(const sid of sourcesId) {
    results[sid] = votesObj[sid] || '';
  }
  return results;
}

/*
*  获取用户的点赞信息
* */
postsVoteSchema.statics.getVoteByUid = async (options) => {
  const PostsVoteModel = mongoose.model('postsVotes');
  const {uid, type, id} = options;
  const {comment, article} = voteSources;
  let vote;
  if(!uid) return null;
  if(type === "article") {
    vote = await PostsVoteModel.findOne({source: article, uid, sid: id}).sort({toc: -1});
  } else if(type === "comment") {
    vote = await PostsVoteModel.findOne({source: comment, uid, sid: id}).sort({toc: -1});
  }
  return vote ? vote.type : null;
}

postsVoteSchema.statics.createVoteMessages = async (uid) => {
  const UsersGeneralMode = mongoose.model('usersGeneral');
  const PostsVoteModel = mongoose.model('postsVotes');
  const MessageModel = mongoose.model('messages');
  const SettingModel = mongoose.model('settings');

  const {voteDeadline} = await UsersGeneralMode.findOne({uid}, {voteDeadline: 1});
  const votes = await PostsVoteModel.find({
    tUid: uid,
    uid: {$ne: uid},
    toc: {
      $gte: voteDeadline
    },
    type: voteTypes.up
  }, {
    _id: 1,
    source: 1,
    sid: 1
  });
  const time = new Date();
  await UsersGeneralMode.updateOne({uid}, {
    $set: {
      voteDeadline: time
    }
  });
  const groups = {};
  const votesIdArr = [];
  for(const vote of votes) {
    const {_id, source, sid} = vote;
    if(!groups[`${source}_${sid}`]) {
      const arr = [];
      groups[`${source}_${sid}`] = arr;
      votesIdArr.push(arr);
    }
    groups[`${source}_${sid}`].push(_id);
  }
  for(const votesId of votesIdArr) {
    const message = MessageModel({
      _id: await SettingModel.operateSystemID('messages', 1),
      r: uid,
      ty: 'STU',
      port: '',
      ip: '',
      c: {
        type: 'latestVotes',
        votesId
      }
    });
    await message.save();
  }
}

module.exports = mongoose.model('postsVotes', postsVoteSchema);
