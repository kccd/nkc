const mongoose = require('mongoose');
const tools = require("../nkcModules/tools");
const Schema = mongoose.Schema;

const xsfsRecordTypes = {
  post: 'post',
  article: 'article',
  comment: 'comment'
};

const xsfsRecordSchema = new Schema({
  _id: Number,
  // 学术分变化的人
  uid: {
    type: String,
    required: true,
    index: 1
  },
  // 执行操作的人
  operatorId: {
    type: String,
    required: true,
    index: 1
  },
  //学术分记录类型 post comment article
  type: {
    type: String,
    required: true,
    index: 1
  },
  pid: {
    type: String,
    required: true,
    index: 1
  },
  num: {
    type: Number,
    required: true
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  description: {
    type: String,
    default: ''
  },
  ip: {
    type: String,
    required: true,
    index: 1
  },
  port: {
    type: String,
    required: true
  },
  canceled: {
    type: Boolean,
    default: false,
    index: 1
  },
  tlm: {
    type: Date,
    default: Date.now,
    index: 1
  },
  lmOperatorId: {
    type: String,
    index: 1,
    default: ''
  },
  reason: {
    type: String,
    default: ''
  },
  lmOperatorIp: {
    type: String,
    index: 1,
    default: ''
  },
  lmOperatorPort: {
    type: String,
    default: ''
  }
}, {
  collection: 'xsfsRecords',
  toObject: {
    getters: true,
    virtuals: true
  }
});
xsfsRecordSchema.virtual('fromUser')
  .get(function() {
    return this._fromUser;
  })
  .set(function(p) {
    this._fromUser = p;
  });

/*xsfsRecordSchema.virtual('type')
  .get(function() {
    return this._type;
  })
  .set(function(p) {
    this._type = p;
  });*/

xsfsRecordSchema.statics.getXsfsRecordTypes = () => {
  return xsfsRecordTypes;
};

xsfsRecordSchema.statics.extendXsfsRecords = async (records) => {
  const {timeFormat, getUrl} = require('../nkcModules/tools');
  const UserModel = mongoose.model('users');
  const ArticleModel = mongoose.model('articles');
  const XsfsRecordModel = mongoose.model('xsfsRecords');
  const xsfsRecordTypes = await XsfsRecordModel.getXsfsRecordTypes();
  const usersId = [];
  for(const r of records) {
    const {uid, operatorId, lmOperatorId} = r;
    usersId.push(uid, operatorId, lmOperatorId);
  }
  const usersObject = await UserModel.getUsersObjectByUsersId(usersId);
  const results = [];
  for(const r of records) {
    const {
      uid,
      type,
      pid,
      reason,
      num,
      ip,
      operatorId,
      canceled,
      lmOperatorId,
      toc,
      tlm,
      description,
      lmOperatorIp,
    } = r;
    const user = usersObject[uid];
    const operator = usersObject[operatorId];
    if(!user || !operator) continue;
    const _lmOperator = usersObject[lmOperatorId];
    let lmOperator = null;
    if(_lmOperator) {
      lmOperator = {
        uid: _lmOperator.uid,
        avatarUrl: getUrl('userAvatar', _lmOperator.avatar),
        username: _lmOperator.username,
        homeUrl: getUrl('userHome', _lmOperator.uid)
      };
    }
    let url = '';
    if(type === xsfsRecordTypes.post) {
      url = getUrl('post', pid);
    } else if(type === xsfsRecordTypes.article) {
      const article = await ArticleModel.findOnly({_id: pid});
      const {articleUrl} = await ArticleModel.getArticleUrlBySource(article._id, article.source, article.sid);
      url = articleUrl;
    } else if(type === xsfsRecordTypes.comment) {
      url = getUrl('comment', pid);
    }
    const result = {
      time: timeFormat(toc),
      user: {
        uid: user.uid,
        avatarUrl: getUrl('userAvatar', user.avatar),
        username: user.username,
        homeUrl: getUrl('userHome', user.uid),
      },
      operator: {
        uid: operator.uid,
        avatarUrl: getUrl('userAvatar', operator.avatar),
        username: operator.username,
        homeUrl: getUrl('userHome', operator.uid)
      },
      num,
      description,
      reason,
      ip,
      canceled,
      url,
      lmOperator,
      mTime: tlm? timeFormat(tlm): '',
      lmIp: lmOperatorIp
    };
    results.push(result);
  }
  return results;
};

/*
* 处理comment的xsf和kcb纪录
* */
xsfsRecordSchema.statics.extendCredits = async (credits) => {
  const tools = require('../nkcModules/tools');
  const kcb = [];
  const xsf = [];
  for(const credit of credits) {
    const {_id, hideDescription: hide, creditName, num, type, fromUser, description, toc} = credit;
    const c = {
      _id,
      uid: fromUser.uid,
      username: fromUser.username,
      userHome: tools.getUrl('userHome', fromUser.uid),
      avatar: tools.getUrl('userAvatar', fromUser.avatar),
      description,
      toc,
      number: num
    };
    if(type === 'creditKcb') {
      c.number = c.number / 100;
      c.type = 'kcb';
      c.name = creditName;
      c.hide = hide;
      kcb.push(c);
    } else {
      c.type = 'xsf';
      c.name = '学术分';
      xsf.push(c);
    }
  }
  return {xsf, kcb};
}

module.exports = mongoose.model('xsfsRecords', xsfsRecordSchema);
