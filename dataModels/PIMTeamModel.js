const mongoose = require('../settings/database');
const schema = new mongoose.Schema({
  // 团队 ID
  _id: Number,
  // 团队创建时间
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 团队创始人
  uid: {
    type: String,
    default: '',
    index: 1
  },
  membersId: {
    type: [String],
    default: [],
    index: 1
  },
  // 团队名称
  name: {
    type: String,
    required: true,
    index: 1
  },
  // 团队介绍
  description: {
    type: String,
    default: ''
  },
  // 是否被封禁
  disabled: {
    type: Boolean,
    default: false,
    index: 1
  }
}, {
  collection: 'PIMTeams'
});

schema.statics.getTeamsByUserId = async uid => {
  const PIMTeamModel = mongoose.model('PIMTeams');
  return PIMTeamModel.find({membersId: uid, disabled: false}, {
    _id: 1,
    toc: 1,
    uid: 1,
    membersId: 1,
    name: 1,
    description: 1
  }).sort({toc: 1});
};

schema.statics.checkTeamInfo = async team => {
  const {name, description} = team;
  const {checkString} = require('../nkcModules/checkData');
  checkString(name, {
    name: '团队名称',
    minLength: 1,
    maxLength: 30
  });
  checkString(description, {
    name: '团队介绍',
    minLength: 0,
    maxLength: 1000
  });
}

module.exports = mongoose.model('PIMTeams', schema);