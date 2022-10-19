const mongoose = require('../settings/database');
const getRedisKeys = require("../nkcModules/getRedisKeys");
const redisClient = require("../settings/redisClient");
const {ThrowErrorToRenderFullErrorPage} = require("../nkcModules/error");

const collectionName = 'accessControl';

const controlSources = {
  column: 'column',
  zone: 'zone',
  community: 'community',
  fund: 'fund',
  global: 'global',
  user: 'user',
  search: 'search',
};

const platformData = {
  enabled: {
    type: Boolean,
    default: false,
  },
  whitelist: {
    rolesId: {
      type: [String],
      default: [],
    },
    gradesId: {
      type: [Number],
      default: [],
    },
    relation: {
      type: String,
      default: 'or'
    },
    usersId: {
      type: [String],
      default: [],
    }
  },
  userDesc: {
    type: String,
    default: '',
  },
  visitorDesc: {
    type: String,
    default: '',
  }
}

const schema = new mongoose.Schema({
  toc: {
    type: Date,
    default: Date.now,
  },
  source: {
    type: String,
    required: true,
    index: 1,
  },
  sid: {
    type: String,
    default: '',
    index: 1,
  },
  app: platformData,
  web: platformData,
}, {
  collection: collectionName
});

let AccessControlModel;

// 获取类型
schema.statics.getSources = () => {
  return {...controlSources};
};

schema.statics.createAccessControl = async props => {
  const {
    source,
    sid = '',
    app,
    web,
  } = props;
  const control = await AccessControlModel({
    source,
    sid,
    app: {
      enabled: app.enabled,
      whitelist: app.whitelist,
      userDesc: app.userDesc,
      visitorDesc: app.visitorDesc,
    },
    web: {
      enabled: web.enabled,
      whitelist: web.whitelist,
      userDesc: web.userDesc,
      visitorDesc: web.visitorDesc,
    }
  });
  await control.save();
  return control;
};

schema.statics.getAllAccessControlDetail = async () => {
  const UserModel = mongoose.model('users');
  const accessControl = await AccessControlModel.find({}, {
    source: 1,
    sid: 1,
    app: 1,
    web: 1,
  }).sort({toc: 1});
  let usersId = [];
  for(const ac of accessControl) {
    usersId.push([...ac.app.whitelist.usersId, ...ac.web.whitelist.usersId]);
  }
  usersId = [...new Set(usersId)];
  const usersObj = await UserModel.getUsersObjectByUsersId(usersId);
  const accessControlDetail = [];

  const getUsersByUsersId = (usersId) => {
    const users = [];
    for(const uid of usersId) {
      const user = usersObj[uid];
      if(!user) continue;
      users.push(user);
    }
    return users;
  };

  for(const ac of accessControl) {
    const {
      source,
      sid,
      app,
      web,
    } = ac;
    const appUsers = getUsersByUsersId(app.whitelist.usersId);
    const webUsers = getUsersByUsersId(web.whitelist.usersId);
    accessControlDetail.push({
      source,
      sid,
      app: {
        ...app,
        whitelist: {
          ...app.whitelist,
          users: appUsers,
        }
      },
      web: {
        ...web,
        whitelist: {
          ...web.whitelist,
          users: webUsers,
        }
      },
    });
  }
  return accessControlDetail;
};

schema.statics.saveToCache = async () => {
  const getRedisKeys = require('../nkcModules/getRedisKeys');
  const redisClient = require("../settings/redisClient");
  const accessControl = await AccessControlModel.find({}, {
    source: 1,
    sid: 1,
    app: 1,
    web: 1,
  });
  const key = getRedisKeys('accessControl');
  const acObj = {};
  for(const ac of accessControl) {
    const {source, sid, app, web} = ac;
    acObj[`${source}-${sid}`] = {
      source,
      sid,
      app,
      web,
    };
  }
  await redisClient.setAsync(key, JSON.stringify(acObj));
  return acObj;
}

schema.statics.getFromCache = async (source, sid = '') => {
  const key = getRedisKeys('accessControl');
  let acObj = await redisClient.getAsync(key);
  if(!acObj) {
    acObj = await AccessControlModel.saveToCache();
  } else {
    acObj = JSON.parse(acObj);
  }
  return acObj[`${source}-${sid}`];
}

schema.statics.checkAccessControlPermissionWithThrowError = async (props) => {
  try {
    await AccessControlModel.checkAccessControlPermission(props);
  } catch(err) {
    ThrowErrorToRenderFullErrorPage(err.status || 403, {
      abstract: err.message
    });
  }
};

schema.statics.checkAccessControlPermission = async (props) => {
  const {
    uid,
    rolesId,
    gradeId,
    isApp,
    source,
    sid = ''
  } = props;
  const accessControl = await AccessControlModel.getFromCache(source, sid);
  const platform = isApp? 'app': 'web';
  if(!['app', 'web'].includes(platform)) throwErr(500, `访问控制未知平台 platform=${platform}`);
  const targetAC = accessControl[platform];
  // 未开启访问控制
  if(!targetAC.enabled) return;
  // 当前用户为指定的特殊用户
  if(!!uid && targetAC.whitelist.usersId.includes(uid)) return;

  let hasRole = false;
  for(const roleId of rolesId) {
    if(!targetAC.whitelist.rolesId.includes(roleId)) continue;
    hasRole = true;
    break;
  }
  const hasGrade = !!uid && targetAC.whitelist.gradesId.includes(gradeId);
  // 当关系为 and 时，拥有证书和等级
  // 当关系为 or 时，拥有证书或等级
  if(
    (
      targetAC.whitelist.relation === 'and' &&
      hasRole &&
      hasGrade
    ) ||
    (
      targetAC.whitelist.relation === 'or' &&
      (
        hasRole ||
        hasGrade
      )
    )
  ) return;
  const error = new Error(uid? targetAC.userDesc: targetAC.visitorDesc);
  error.status = 403;
  throw error;
};

schema.statics.getCanAccessApps = async (props) => {
  const {
    uid,
    rolesId,
    gradeId,
    isApp,
  } = props;
  const sources = await AccessControlModel.getSources();
  const apps = {};
  for(const source of Object.values(sources)) {
    try{
      await AccessControlModel.checkAccessControlPermission({
        uid,
        rolesId,
        gradeId,
        isApp,
        source,
      });
      apps[source] = true;
    } catch(err) {
      apps[source] = false;
    }
  }
  return apps;
}

AccessControlModel = mongoose.model(collectionName, schema);

module.exports = AccessControlModel;
