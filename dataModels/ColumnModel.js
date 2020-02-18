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
    default: "#f6f6f6"
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
  toc: {
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
    default: 0
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
    const count = await ColumnPostModel.count({
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
  const column = await mongoose.model("columns").findOne({_id: columnId});
  if(!column) throwErr(404, `未找到ID为${columnId}的专栏`);
  const data = {
    username: column.name,
    description: column.abbr,
    uid: column.uid,
    toc: column.toc,
    tid: column._id
  };
  const es = require("../nkcModules/elasticSearch");
  await es.save("column", data);
};


/*
* 获取置顶专栏
* */
schema.statics.getToppedColumns = async () => {
  const homeSettings = await mongoose.model("settings").getSettings("home");
  const columns = await mongoose.model("columns").find({_id: {$in: homeSettings.columnsId}});
  const columnsObj = {};
  columns.map(column => columnsObj[column._id] = column);
  const results = [];
  homeSettings.columnsId.map(cid => {
    const column = columnsObj[cid];
    if(column) results.push(column);
  });
  return results;
};

module.exports = mongoose.model("columns", schema);