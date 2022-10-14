const mongoose = require('../settings/database');
const collectionName = 'OAuthApps';
const appStatus = {
  normal: 'normal', // 正常
  disabled: 'disabled', // 被屏蔽
  deleted: 'deleted', // 被删除
  unknown: 'unknown', // 待审核
};
const appOperations = {
  signIn: 'signIn',
};
const schema = mongoose.Schema({
  _id: String,
  name: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: ''
  },
  desc: {
    type: String,
    default: '',
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1,
  },
  secret: {
    type: String,
    required: true,
    index: 1,
  },
  uid: {
    type: String,
    required: true,
    index: 1
  },
  status: {
    type: String,
    default: appStatus.unknown,
    index: 1
  },
  operations: {
    type: [String],
    default: [],
  },
  callback: {
    type: String,
    required: true,
  },
  home: {
    type: String,
    required: true,
  },
}, {
  collection: collectionName
});

schema.statics.getAppOperations = () => {
  return {...appOperations};
}
/*
* @return {String}
* */
schema.statics.createAppId = async () => {
  const SettingModel = mongoose.model('settings');
  return SettingModel.operateSystemID('OAuthApps', 1);
}

/*
* @return {String}
* */
schema.statics.createAppSecret = async () => {
  const {getRandomString} = require('../nkcModules/apiFunction');
  return getRandomString('a0', 64);
}
/*
* 创建应用
* @param {String} name
* @param {String} desc
* @param {String} home
* @param {String} callback
* @param {String} uid
* @return {OAuthAppDocument}
* */
schema.statics.createApp = async (props) => {
  const OAuthAppModel = mongoose.model(collectionName);
  const {name, desc, uid, home, callback} = props;
  const appId = await OAuthAppModel.createAppId();
  const appSecret = await OAuthAppModel.createAppSecret();
  const client = new OAuthAppModel({
    _id: appId,
    name,
    desc,
    home,
    callback,
    uid,
    secret: appSecret,
  });
  await client.save();
  return client;
}

schema.methods.ensurePermission= async function(operation) {
  if(!this.operations.includes(operation)) {
    throwErr(403, '权限不足');
  }
}

schema.statics.getAppBySecret = async (appId, secret) => {
  const OAuthAppModel = mongoose.model('OAuthApps');
  const app = await OAuthAppModel.findOne({_id: appId, secret});
  if(!app) {
    throwErr(403, '应用ID或秘钥错误');
  }
  if(app.status !== appStatus.normal) {
    throwErr(403, `应用不可用 status=${app.status}`);
  }
  return app;
};

schema.statics.getAppById = async (appId) => {
  const OAuthAppModel = mongoose.model('OAuthApps');
  const app = await OAuthAppModel.findOne({_id: appId});
  if(!app) {
    throwErr(400, `appId无效`);
  }
  return app;
}

module.exports = mongoose.model(collectionName, schema);
