const mongoose = require("../settings/database");
const Schema = mongoose.Schema;
const schema = new Schema({
  _id: Number,
  // 专栏主
  uid: {
    type: String,
    required: true,
    index: 1
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
  // 友情链接
  otherLinks: {
    type: Schema.Types.Mixed,
    default: []
  },

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
module.exports = mongoose.model("columns", schema);