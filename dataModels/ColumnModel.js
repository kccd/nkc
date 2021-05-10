const mongoose = require("../settings/database");
const moment = require("moment");
const Schema = mongoose.Schema;
const schema = new Schema({
  _id: Number,
  // 专栏主
  uid: {
    type: String,
    required: true,
    index: 1
  },
  // 专栏logo
  avatar: {
    type: String,
    default: ""
  },
  // 专栏banner
  banner: {
    type: String,
    default: ""
  },
  // 专栏主上任记录 {uid: String, time: Date}
  userLogs: {
    type: Schema.Types.Mixed,
    required: true
  },
  color: {
    type: String,
    default: "#eee"
  },
  topped: {
    type: [Number],
    default: [],
    index: 1
  },
  // 专栏公告通知
  notice: {
    type: String,
    default: ""
  },
  noticeDisabled: {
    type: Boolean,
    default: false
  },
  // 专栏创建时间
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 专栏更新时间
  tlm: {
    type: Date,
    default: Date.now,
    index: 1
  },
  name: {
    type: String,
    required: true,
    index: 1
  },
  nameLowerCase: {
    type: String,
    required: true,
    index: 1
  },
  abbr: {
    type: String,
    required: true,
  },
  description: {
    type:  String,
    default: "",
  },
  // 是否关闭
  closed: {
    type: Boolean,
    default: false,
    index: 1
  },
  // 是否被屏蔽
  disabled: {
    type: Boolean,
    default: false,
    index: 1
  },
  // 专栏的关注数
  subCount: {
    type: Number,
    index: 1,
    default: 0
  },
  // 专栏文章数
  postCount: {
    type: Number,
    index: 1,
    default: 0,
  },
  // 自定义链接
  links: {
    type: Schema.Types.Mixed,
    default: []
  },
  linksDisabled: {
    type: Boolean,
    default: false
  },
  // 友情链接
  otherLinks: {
    type: Schema.Types.Mixed,
    default: []
  },
  otherLinksDisabled: {
    type: Boolean,
    default: false
  },
  // 自定义右侧豆腐块
  // {name, content, show}
  blocks: {
    type: Schema.Types.Mixed,
    default: []
  },
  blocksDisabled: {
    type: Boolean,
    default: false
  },
  // 展开分类，专栏导航显示一级分类
  navCategory: {
    type: Boolean,
    default: false
  },
  // 隐藏默认分类
  hideDefaultCategory: {
    type: Boolean,
    default: false,
  },
  // 每页内容条数
  perpage: {
    type: Number,
    default: 30
  },
  // 是否已经通知过管理员了
  contacted: {
    type: Boolean,
    default: false
  },
  // 专栏内文章总阅读数
  postHits: {
    type: Number,
    default: 0
  },
  // 专栏内文章的点赞数
  postVoteUp: {
    type: Number,
    default: 0
  },
  // 获赞数、阅读数的更新时间
  refreshTime: {
    type: Date,
    default: null,
  }
}, {
  collection: "columns"
});

/*
* 拓展专栏信息
* */
schema.methods.extendColumn = async function () {
  const ColumnModel = mongoose.model("columns");
  const columns = await ColumnModel.extendColumns([this]);
  return columns[0];
};
schema.statics.extendColumns = async (columns) => {
  const UserModel = mongoose.model("users");
  const uid = new Set();
  for(const c of columns) {
    uid.add(c.uid);
  }
  const users = await UserModel.find({uid: {$in: [...uid]}});
  const usersObj = {};
  users.map(user => {
    usersObj[user.uid] = user;
  });
  const results = [];
  for(let column of columns) {
    column = column.toObject();
    column.user = usersObj[column.uid];
    results.push(column);
  }
  return results;
};
/*
* 获取专栏时间线
* */
schema.statics.getTimeline = async (columnId) => {
  const ColumnPostModel = mongoose.model("columnPosts");
  const firstColumnPost = await ColumnPostModel.findOne({}, {top: 1}).sort({top: 1});
  if(!firstColumnPost) return [];
  const beginTime = firstColumnPost.top;
  const endTime = new Date();
  const begin = {
    year: beginTime.getFullYear(),
    month: beginTime.getMonth() + 1
  };
  const end = {
    year: endTime.getFullYear(),
    month: endTime.getMonth() + 1
  };

  const time = [];
  let n = 0;
  while(1) {
    n++;
    if(n > 1000) break;
    const t = {
      begin: new Date(`${begin.year}-${begin.month}-1 00:00:00`)
    };
    begin.month ++;
    if(begin.month >= 13) {
      begin.year ++;
      begin.month = 1;
    }
    t.end = new Date(`${begin.year}-${begin.month}-1 00:00:00`);
    time.push(t);
    if(begin.year > end.year && begin.month > end.month) break;
  }
  const results = [];
  for(const t of time) {
    const count = await ColumnPostModel.countDocuments({
      columnId,
      toc: {
        $gte: t.begin,
        $lt: t.end
      }
    });
    if(!count) continue;
    results.push({
      time: moment(t.begin).format("YYYY年MM月"),
      count
    });
  }
  return results.reverse();
};

/*
* 获取用户关注的专栏
* @param {String} uid 用户ID
* */
schema.statics.getUserSubColumns = async (uid) => {
  const subs = await mongoose.model("subscribes").find({
    type: "column",
    uid: uid
  }, {columnId: 1}).sort({toc: -1});
  const columns = [];
  for(const sub of subs) {
    const column = await mongoose.model("columns").findOne({_id: sub.columnId});
    if(column) columns.push(column);
  }
  return columns;
};
/*
* 更新专栏在搜索数据库中的数据
* */
schema.statics.toSearch = async (columnId) => {
  const ColumnModel = mongoose.model('columns');
  const column = await ColumnModel.findOne({_id: columnId});
  if(!column) {
    const err = new Error(`未找到ID为${columnId}的专栏`);
    err.status = 404;
    throw err;
  }
  await ColumnModel.saveColumnToElasticSearch(column);
};

/*
* 同步专栏数据到ES数据库
* @param {Object} column 专栏对象
* @author pengxiguaa 2020/7/7
* */
schema.statics.saveColumnToElasticSearch = async (column) => {
  if(!column) throwErr('专栏不能为空');
  const data = {
    username: column.name,
    description: column.abbr,
    uid: column.uid,
    toc: column.toc,
    tid: column._id
  };
  const es = require('../nkcModules/elasticSearch');
  await es.save('column', data);
};

/*
* 同步所有专栏数据到ES数据库
* @author pengxiguaa 2020/7/7
* */
schema.statics.saveAllColumnToElasticSearch = async () => {
  const ColumnModel = mongoose.model('columns');
  const count = await ColumnModel.countDocuments();
  const limit = 2000;
  for(let i = 0; i <= count; i+=limit) {
    const columns = await ColumnModel.find().sort({toc: 1}).skip(i).limit(limit);
    for(const column of columns) {
      await ColumnModel.saveColumnToElasticSearch(column);
    }
    console.log(`【同步Column到ES】 总：${count}, 当前：${i} - ${i + limit}`);
  }
  console.log(`【同步Column到ES】完成`);
};

/*
* 拓展专栏的最新文章
* */
schema.statics.extendColumnsPosts = async (columns, count) => {
  const ColumnPostModel = mongoose.model('columnPosts');
  const PostModel = mongoose.model('posts');
  const columnsObj = {};
  const columnIdObj = {};
  const postsId = [];
  const tocObj = {};
  for(let column of columns) {
    let {_id} = column;
    columnsObj[column._id] = column;
    const columnPosts = await ColumnPostModel.find({
      columnId: _id,
      hidden: false,
      type: 'thread'
    }, {
      pid: 1,
      columnId: 1,
      toc: 1,
    }).sort({toc: -1}).limit(count);
    for(const cp of columnPosts) {
      const {pid, columnId, toc} = cp;
      tocObj[pid] = toc;
      if(!columnIdObj[columnId]) columnIdObj[columnId] = [];
      columnIdObj[columnId].push(pid);
      postsId.push(pid);
    }
  }
  const posts = await PostModel.find({pid: {$in: postsId}}, {
    pid: 1,
    tid: 1,
    t: 1,
  });
  const postsObj = {};
  posts.map(post => {
    post.toc = tocObj[post.pid];
    postsObj[post.pid] = post;
  });
  const results = [];
  columns.map(column => {
    column = column.toObject? column.toObject(): column;
    const postsId = columnIdObj[column._id] || [];
    const posts = [];
    for(const pid of postsId) {
      const post = postsObj[pid];
      if(!post) continue;
      posts.push(post);
    }
    column.posts = posts;
    results.push(column);
  });
  return results;
};

/*
* 获取主页热门专栏
* */
schema.statics.getHomeHotColumns = async () => {
  const ColumnModel = mongoose.model('columns');
  const {hotColumns} = await ColumnModel.getHotColumns();
  return await ColumnModel.extendColumnsPosts(hotColumns, 3);
};

/*
* 获取主页置顶专栏
* */
schema.statics.getHomeToppedColumns = async () => {
  const ColumnModel = mongoose.model('columns');
  const {toppedColumns} = await ColumnModel.getHotColumns();
  return await ColumnModel.extendColumnsPosts(toppedColumns, 3);
};

/*
* 统计并设置专栏文章数
* @return {Number} 文章数
* @author pengxiguaa 2021-3-31
* */
schema.methods.updateBasicInfo = async function() {
  const ColumnPostModel = mongoose.model('columnPosts');
  const ThreadModel = mongoose.model('threads');
  const PostModel = mongoose.model('posts');
  const UsersBehaviorModel = mongoose.model('usersBehaviors');
  const {_id} = this;
  const columnPosts = await ColumnPostModel.find({columnId: _id}, {pid: 1, tid: 1});
  const postsId = [];
  const threadsId = [];
  columnPosts.map(cp => {
    postsId.push(cp.pid);
    threadsId.push(cp.tid);
  });
  const columnPostCount = columnPosts.length;
  const hits = await UsersBehaviorModel.countDocuments({
    tid: {$in: threadsId},
    operationId: 'visitThread'
  });
  /*
  let hits = await ThreadModel.aggregate([
    {
      $match: {
        oc: {$in: postsId}
      }
    },
    {
      $group: {
        _id: "count",
        count: {
          $sum: "$hits"
        }
      }
    }
  ]);
  hits = hits.length? hits[0].count: 0;*/
  let voteUp = await PostModel.aggregate([
    {
      $match: {
        pid: {$in: postsId}
      }
    },
    {
      $group: {
        _id: 'count',
        count: {
          $sum: "$voteUp"
        }
      }
    }
  ]);
  voteUp = voteUp.length? voteUp[0].count: 0;
  const lastPost = await ColumnPostModel.findOne({columnId: _id}, {toc: 1}).sort({toc: -1});
  this.postCount = columnPostCount;
  this.tlm = lastPost? lastPost.toc: this.toc;
  this.refreshTime = Date.now();
  this.postHits = hits;
  this.postVoteUp = voteUp;
  await this.save();
};
schema.statics.getTrendTime = async (minTime, maxTime) => {
  const apiFunction = require('../nkcModules/apiFunction');
  const minTimeNumber = apiFunction.today(minTime).getTime();
  const times = [];
  const maxTimeNumber = maxTime.getTime();
  const oneDay = 24 * 60 * 60 * 1000;
  for(let i = minTimeNumber; i < maxTimeNumber; i += oneDay) {
    const t = new Date(i);
    times.push(moment(t).format(`YYYY-MM-DD`));
  }
  return {
    times,
    minTime: new Date(minTimeNumber),
    maxTime
  };
}
/*
* 获取专栏的订阅趋势
* @param {Date} minTime 最小时间
* @param {Date} maxTime 最大时间
* @return {Array} [{time: '2021-02-06', count: 23}, ...]
* */
schema.methods.getSubscriptionTrends = async function(minTime, maxTime) {
  const ColumnModel = mongoose.model('columns');
  const SubscribeModel = mongoose.model('subscribes');
  const columnId = this._id;
  const {
    times,
    minTime: _minTime,
    maxTime: _maxTime
  } = await ColumnModel.getTrendTime(minTime, maxTime);
  let sub = await SubscribeModel.aggregate(
    [
      {
        $match: {
          type: 'column',
          columnId: columnId,
          toc: {
            $gte: _minTime,
            $lt: _maxTime
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$toc'
            }
          },
          count: {
            $sum: 1
          }
        }
      }
    ]
  );
  let unsub = await SubscribeModel.aggregate(
    [
      {
        $match: {
          type: 'column',
          columnId: columnId,
          tlm: {
            $gte: _minTime,
            $lt: _maxTime
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$tlm'
            }
          },
          count: {
            $sum: 1
          }
        }
      }
    ]
  );
  const subObj = {};
  const unsubObj = {};
  for(const s of sub) {
    subObj[s._id] = s.count;
  }
  for(const s of unsub) {
    unsubObj[s._id] = s.count;
  }
  const subscriptions = [];
  for(const time of times) {
    const sub = subObj[time] || 0;
    const unsub = unsubObj[time] || 0;
    subscriptions.push({
      time,
      count: sub - unsub
    });
  }
  return subscriptions;
};
/*
* 获取专栏的阅读趋势
* @param {Date} minTime 最小时间
* @param {Date} maxTime 最大时间
* */
schema.methods.getHitTrends = async function(minTime, maxTime) {
  const ColumnModel = mongoose.model('columns');
  const ColumnPostModel = mongoose.model('columnPosts');
  const UsersBehaviorModel = mongoose.model('usersBehaviors');
  const columnId = this._id;
  const {
    times,
    minTime: _minTime,
    maxTime: _maxTime
  } = await ColumnModel.getTrendTime(minTime, maxTime);
  const columnPosts = await ColumnPostModel.find({
    from: 'own',
    type: 'thread',
    columnId: columnId,
  }, {
    tid: 1
  });
  const columnThreadsId = columnPosts.map(cp => cp.tid);
  let hits = await UsersBehaviorModel.aggregate(
    [
      {
        $match: {
          tid: {$in: columnThreadsId},
          operationId: 'visitThread',
          timeStamp: {
            $gte: _minTime,
            $lt: _maxTime,
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$timeStamp'
            }
          },
          count: {
            $sum: 1
          }
        }
      }
    ]
  );
  const hitObj = {};
  for(const h of hits) {
    hitObj[h._id] = h.count;
  }
  const _hits = [];
  for(const time of times) {
    const count = hitObj[time] || 0;
    _hits.push({
      time,
      count
    });
  }
  return _hits;
};
schema.methods.getVoteUpTrends = async function(minTime, maxTime) {
  const ColumnModel = mongoose.model('columns');
  const ColumnPostModel = mongoose.model('columnPosts');
  const PostsVoteModel = mongoose.model('postsVotes');
  const columnId = this._id;
  const {
    times,
    minTime: _minTime,
    maxTime: _maxTime
  } = await ColumnModel.getTrendTime(minTime, maxTime);
  const columnPosts = await ColumnPostModel.find({
    from: 'own',
    type: 'thread',
    columnId: columnId,
  }, {
    pid: 1
  });
  const columnPostsId = columnPosts.map(cp => cp.pid);
  let voteUp = await PostsVoteModel.aggregate(
    [
      {
        $match: {
          pid: {$in: columnPostsId},
          type: 'up',
          toc: {
            $gte: _minTime,
            $lt: _maxTime,
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$toc'
            }
          },
          count: {
            $sum: '$num'
          }
        }
      }
    ]
  );
  const voteUpObj = {};
  for(const h of voteUp) {
    voteUpObj[h._id] = h.count;
  }
  voteUp = [];
  for(const time of times) {
    const count = voteUpObj[time] || 0;
    voteUp.push({
      time,
      count
    });
  }
  return voteUp;
};
/*
* 获取专栏文章分享趋势
* */
schema.methods.getShareTrends = async function(minTime, maxTime) {
  const ColumnModel = mongoose.model('columns');
  const ColumnPostModel = mongoose.model('columnPosts');
  const ShareModel = mongoose.model('share');
  const columnId = this._id;
  const {
    times,
    minTime: _minTime,
    maxTime: _maxTime
  } = await ColumnModel.getTrendTime(minTime, maxTime);
  const columnPosts = await ColumnPostModel.find({
    from: 'own',
    type: 'thread',
    columnId: columnId,
  }, {
    pid: 1
  });
  const columnPostsId = columnPosts.map(cp => cp.pid);
  let share = await ShareModel.aggregate(
    [
      {
        $match: {
          tokenType: 'post',
          targetId: {$in: columnPostsId},
          toc: {
            $gte: _minTime,
            $lt: _maxTime,
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$toc'
            }
          },
          count: {
            $sum: 1
          }
        }
      }
    ]
  );
  const shareObj = {};
  for(const h of share) {
    shareObj[h._id] = h.count;
  }
  share = [];
  for(const time of times) {
    const count = shareObj[time] || 0;
    share.push({
      time,
      count
    });
  }
  return share;
};

/*
* 更新首页热门专栏
* */
schema.statics.updateHomeHotColumns = async () => {
  const SettingModel = mongoose.model('settings');
  const ColumnModel = mongoose.model('columns');
  const homeSettings = await SettingModel.getSettings('home');
  const {
    columnCount,
    minPostCount,
    updateTime,
    minSubscriptionCount,
  } = homeSettings.columnPool;
  const existingColumnsId = homeSettings.columnsId.concat(homeSettings.toppedColumnsId);
  let columnsId;
  if(columnCount === 0) {
    columnsId  = [];
  } else {
    let columns = await ColumnModel.aggregate([
      {
        $match: {
          disabled: false,
          closed: false,
          _id: {$nin: existingColumnsId},
          postCount: {
            $gte: minPostCount
          },
          tlm: {
            $gte: new Date(Date.now() - updateTime * 24 * 60 * 60 * 1000)
          },
          subCount: {
            $gte: minSubscriptionCount
          }
        }
      },
      {
        $sample: {
          size: columnCount
        }
      },
      {
        $group: {
          _id: '$_id'
        }
      }
    ]);
    columns = columns || [];
    columnsId = columns.map(c => c._id);
  }
  await SettingModel.updateOne({_id: 'home'}, {
    $set: {
      'c.columnPool.columnsId': columnsId
    }
  });
  await SettingModel.saveSettingsToRedis('home');
};

/*
* 获取主页热门专栏
* */
schema.statics.getHotColumns = async () => {
  const SettingModel = mongoose.model('settings');
  const ColumnModel = mongoose.model('columns');
  const apiFunction = require('../nkcModules/apiFunction');
  const homeSettings = await SettingModel.getSettings('home');
  const columnsId = homeSettings.columnsId;
  const poolColumnsId = homeSettings.columnPool.columnsId;
  const toppedColumnsId = homeSettings.toppedColumnsId;
  let sort;
  if(homeSettings.columnListSort === 'updateTime') {
    sort = {
      tlm: -1
    }
  } else {
    sort = {
      postCount: -1
    }
  }
  let _columns = await ColumnModel.find({
    _id: {
      $in: columnsId.concat(poolColumnsId, toppedColumnsId)
    },
    disabled: false,
    closed: false,
  })
    .sort(sort);
  const columnsObj = {};
  let allColumnsId = [];
  const allHotColumnsId = columnsId.concat(poolColumnsId);
  _columns.map(column => {
    columnsObj[column._id] = column;
    if(allHotColumnsId.includes(column._id)) {
      allColumnsId.push(column._id);
    }
  });
  const columns = [];
  const poolColumns = [];
  for(const cid of columnsId) {
    const column = columnsObj[cid];
    if(!column) continue;
    columns.push(column);
  }
  for(const cid of poolColumnsId) {
    const column = columnsObj[cid];
    if(!column) continue;
    poolColumns.push(column);
  }
  allColumnsId = apiFunction.arrayShuffle(allColumnsId);
  const targetColumnsId = allColumnsId.slice(0, homeSettings.columnCount);
  return {
    columns,
    poolColumns,
    hotColumns: _columns.filter(c => targetColumnsId.includes(c._id)),
    toppedColumns: _columns.filter(c => toppedColumnsId.includes(c._id))
  };
};

module.exports = mongoose.model("columns", schema);
