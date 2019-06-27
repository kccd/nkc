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
  abbr: {
    type: String,
    required: true,
  },
  description: {
    type:  String,
    required: true
  },
  // 专栏的关注数
  subCount: {
    type: Number,
    default: 0
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

module.exports = mongoose.model("columns", schema);