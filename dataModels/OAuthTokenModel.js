const mongoose = require('../settings/database');
const {getRandomString} = require("../nkcModules/apiFunction");

const tokenValidityTime = 30 * 60 * 1000; // token有效期为30分钟

const collectionName = 'OAuthTokens';

const tokenStatus = {
  unused: 'unused', // 未使用
  authorized: 'authorized', // 已授权
  invalid: 'invalid', // 无效
};

const schema = mongoose.Schema({
  token: {
    type: String,
    required: true,
    index: 1,
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1,
  },
  appId: {
    type: String,
    required: true,
    index: 1,
  },
  operation: {
    type: String,
    required: true,
    index: 1,
  },
  callback: {
    type: String,
    required: true,
  },
  used: {
    type: Boolean,
    default: false,
    index: 1,
  },
  status: {
    type: String,
    default: tokenStatus.unused,
    index: 1,
  },
  uid: {
    type: String,
    default: '',
    index: 1,
  }
}, {
  collection: collectionName,
});

schema.statics.createTokenString = async () => {
  const OAuthTokenModel = mongoose.model('OAuthTokens');
  const {getRandomString} = require('../nkcModules/apiFunction');
  let token = '';
  let count = 0;
  while(true) {
    count ++;
    const newToken = getRandomString('a0', 64);
    if(!await OAuthTokenModel.findOne({token: newToken},  {_id: 1})) {
      token = newToken;
      break;
    }
    if(count > 10) {
      throwErr(500, `生成OAuthToken出错`);
    }
  }
  return token;
}

schema.statics.getTokenStatus = () => {
  return {...tokenStatus};
}

schema.statics.createToken = async (appId, operation, callback) => {
  const OAuthTokenModel = mongoose.model('OAuthTokens');
  const tokenString = await OAuthTokenModel.createTokenString();
  const token = new OAuthTokenModel({
    token: tokenString,
    appId,
    operation,
    callback,
  });
  await token.save();
  return tokenString;
};

schema.statics.getTokenByTokenString = async (tokenString) => {
  const OAuthTokenModel = mongoose.model('OAuthTokens');
  const token = await OAuthTokenModel.findOne({token: tokenString});
  if(!token) {
    throwErr(400, `token无效`);
  }
  return token;
}

schema.methods.verifyTokenTime = async function() {
  const token = this;
  if(Date.now() - new Date(token.toc).getTime() > tokenValidityTime) {
    throwErr(400, 'token已过期');
  }
}

schema.methods.verifyTokenBeforeAuthorize = async function() {
  const token = this;
  await token.verifyTokenTime();
  if(
    token.status !== tokenStatus.unused
  ) {
    throwErr(400, 'token无效');
  }
};

schema.methods.verifyTokenAfterAuthorize = async function() {
  const token = this;
  await token.verifyTokenTime();
  if(
    token.status !== tokenStatus.authorized
  ) {
    throwErr(400, 'token无效');
  }
}

schema.methods.useToken = async function() {
  await this.updateOne({
    $set: {
      status: tokenStatus.invalid,
    }
  });
};

schema.methods.authorizeToken = async function(uid) {
  const UsersPersonalModel = mongoose.model('usersPersonal');
  await this.updateOne({
    $set: {
      uid,
      status: tokenStatus.authorized
    }
  });
  await UsersPersonalModel.updateOne({uid}, {
    $addToSet: {
      oauthAppId: this.appId,
    }
  });
};

schema.methods.getContent = async function() {
  const OAuthAppModel = mongoose.model('OAuthApps');
  const appOperations = await OAuthAppModel.getAppOperations();
  const {operation} = this;

  switch(operation) {
    case appOperations.signIn: {
      return await this.getSignInContent();
    }
    default: throwErr(500, `unknown oauth operation ${operation}`);
  }
}

schema.methods.getSignInContent = async function() {
  return {uid: this.uid};
}

module.exports = mongoose.model(collectionName, schema);
