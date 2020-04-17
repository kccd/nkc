// 一些操作的记录，用于限制部分操作的次数
const settings = require('../settings');
const mongoose = settings.database;
const moment = require("moment");
const schema = new mongoose.Schema({
  type: { // 操作名相关
    type: String,
    required: true,
    index: 1
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  uid: {
    type: String,
    index: 1,
    default: ""
  },
  username: {
    type: String,
    index: 1,
    default: ""
  },
  usernameLowerCase: {
    type: String,
    index: 1,
    default: ""
  },
  mobile: {
    type: String,
    index: 1,
    default: ""
  },
  nationCode: {
    type: String,
    index: 1,
    default: ""
  },
  ip: {
    type: String,
    index: 1,
    default: ""
  },
  code: {
    type: String,
    default: '',
    index: 1
  },
  port: {
    type: String,
    index: 1,
    default: ""
  },
  password: {
    type: String,
    default: ""
  },
  email: {
    type: String,
    index: 1,
    default: ""
  }
});

// 仅保留密码的前两位
schema.pre("save", function(next) {
  this.password = this.password.slice(0, 2);
  next();
});

schema.statics.getCountLimitByType = async (type) => {
  if(type === "login") {
    const loginSettings = await mongoose.model("settings").getSettings("login");
    const {
      ipCountLimit, usernameCountLimit, mobileCountLimit
    } = loginSettings.login;
    return {
      ipCountLimit,
      usernameCountLimit,
      mobileCountLimit
    };
  } else if(type === "resetPassword") {
    const loginSettings = await mongoose.model("settings").getSettings("login");
    const {
      ipCountLimit, usernameCountLimit, mobileCountLimit, emailCountLimit
    } = loginSettings.resetPassword;
    return {
      ipCountLimit,
      emailCountLimit,
      usernameCountLimit,
      mobileCountLimit
    };
  }
};

schema.statics.insertBehavior = async (options) => {
  const AccountBehaviorModel = mongoose.model("accountBehaviors");
  const {
    type, username = "", password, ip, mobile, nationCode,
    port, code, email
  } = options;
  const b = AccountBehaviorModel({
    type,
    username,
    email,
    usernameLowerCase: username.toLowerCase(),
    password,
    ip,
    port,
    mobile,
    code,
    nationCode
  });
  await b.save();
};

schema.statics.ensurePermission = async (options) => {
  const AccountBehaviorModel = mongoose.model("accountBehaviors");
  const {
    type, username, ip, mobile, nationCode, email
  } = options;
  const redLock = require("../nkcModules/redLock");
  const lock = await redLock.lock(`accountBehaviorPermission:${type}`, 6000);
  try{
    const {
      usernameCountLimit,
      mobileCountLimit,
      ipCountLimit,
      emailCountLimit
    } = await AccountBehaviorModel.getCountLimitByType(type);
    const t = moment().format("YYYY-MM-DD HH:00:00");
    if(username) {
      const count = await AccountBehaviorModel.count({
        type,
        usernameLowerCase: username.toLowerCase(),
        toc: {
          $gte: new Date(t)
        }
      });
      if(count >= usernameCountLimit) {
        throwErr(403, `尝试次数超出限制，请稍后重试`);
      }
    }
    if(ip) {
      const count = await AccountBehaviorModel.count({
        type,
        ip,
        toc: {
          $gte: new Date(t)
        }
      });
      if(count >= ipCountLimit) {
        throwErr(403, `尝试次数超出限制，请稍后重试`);
      }
    }
    if(mobile && nationCode) {
      const count = await AccountBehaviorModel.count({
        type,
        nationCode,
        mobile,
        toc: {
          $gte: new Date(t)
        }
      });
      if(count >= mobileCountLimit) {
        throwErr(403, `尝试次数超出限制，请稍后重试`);
      }
    }
    if(email) {
      const count = await AccountBehaviorModel.count({
        type,
        email,
        toc: {
          $gte: new Date(t)
        }
      });
      if(count >= emailCountLimit) {
        throwErr(403, `尝试次数超出限制，请稍后重试`);
      }
    }
    await lock.unlock();
  } catch(err) {
    await lock.unlock();
    throwErr(err.status, err.message);
  }

};


module.exports = mongoose.model("accountBehaviors", schema);