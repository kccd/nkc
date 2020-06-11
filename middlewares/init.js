const tools = require('../tools');
const body = require('./body');
const settings = require('../settings');
const nkcModules = require('../nkcModules');
const db = require('../dataModels');
const {logger} = nkcModules;
const languages = require('../languages');
const fs = require('fs');
const {promisify} = require('util');
const redis = require('../redis');
const cookieConfig = require("../config/cookie");

const fsSync = {
  access: promisify(fs.access),
  unlink: promisify(fs.unlink),
  rename: promisify(fs.rename),
  writeFile: promisify(fs.writeFile),
  mkdir: promisify(fs.mkdir),
  exists: promisify(fs.exists),
  existsSync: fs.existsSync,
  copyFile: promisify(fs.copyFile),
  createReadStream: fs.createReadStream,
  createWriteStream: fs.createWriteStream,
  stat: promisify(fs.stat)
};

module.exports = async (ctx, next) => {
  ctx.reqTime = new Date();
  ctx.data = Object.create(null);
  ctx.nkcModules = nkcModules;
  Object.defineProperty(ctx, 'template', {
    get: function() {
      return './pages/' + this.__templateFile
    },
    set: function(fileName) {
      this.__templateFile = fileName
    }
  });
  let {remoteAddress: ip, remotePort: port} = ctx.req.connection;
  let XFF = ctx.get('X-Forwarded-For');
  if(XFF !== '') {
    XFF = XFF.replace(/::ffff:/ig, '');
    const [ip_] = XFF.split(':');
    if(ip_) ip = ip_;
  }
  try{
    ctx.data.operationId = nkcModules.permission.getOperationId(ctx.url, ctx.method);
  } catch(err) {
    if(err.status === 404) {
      console.log(`未知请求：${ip} ${ctx.method} ${ctx.url}`.bgRed);
      ctx.template = "error/error.pug";
      ctx.status = 404;
      ctx.data.status = 404;
      ctx.data.url = ctx.url;
      await body(ctx, () => {});
    } else {
      console.log(err);
    }
    return;
  }
  try {
	  ctx.address = ip;
	  ctx.port = port;
    ctx.body = ctx.request.body;
    const _body= Object.assign({}, ctx.query, ctx.body);
    if(_body.password) {
      _body.password = (_body.password || "").slice(0, 2);
    }
    if(_body.oldPassword) {
      _body.oldPassword = (_body.oldPassword || "").slice(0, 2);
    }
    if(_body.newPassword) {
      _body.newPassword = (_body.newPassword || "").slice(0, 2);
    }
    ctx._body = _body;
    ctx.db = db;
	  ctx.tools = tools;
    ctx.redis = redis;
    ctx.settings = settings;
    ctx.fs = fsSync;

    ctx.state = {
      url: ctx.url.replace(/\?.*/ig, ""),
      // app请求的标识
      isApp: false,
      // app所在系统:  android, ios
      appOS: undefined,
      // app平台: apiCloud, reactNative
      platform: undefined,
      // ReactNative
      twemoji: settings.editor.twemoji,
      // 当前操作
      operation: await db.OperationModel.findOnly({_id: ctx.data.operationId}),
      // - 初始化网站设置
      pageSettings: await db.SettingModel.getSettings("page"),
      postSettings: await db.SettingModel.getSettings("post"),
      serverSettings: await db.SettingModel.getSettings("server"),
      stickerSettings: await db.SettingModel.getSettings("sticker"),
      logSettings: await db.SettingModel.getSettings("log"),
      // 缓存相关
      cachePage: false
    };

    // 判断是否为APP发起的请求
    // apiCloud: NKC/APP/android
    // ReactNative: rn-android、rn-ios
    let userAgent = ctx.header["user-agent"] || "";
    let reg = /NKC\/APP\/(.+)/;
    userAgent = reg.exec(userAgent);
    if(userAgent !== null && ['rn-android', 'rn-ios', 'android'].includes(userAgent[1])) {
      const _userAgent = userAgent[1];
      ctx.state.isApp = true;
      ctx.state.appOS = _userAgent.replace('rn-', '');
      if(_userAgent === 'android') {
        // 兼容apiCloud
        ctx.state.platform = 'apiCloud';
      } else {
        ctx.state.platform = 'reactNative';
      }
    }
	  // 权限判断
    // @param {String} o 操作名
	  ctx.permission = (o) => {
	    if(!ctx.data.userOperationsId) ctx.data.userOperationsId = [];
	    return ctx.data.userOperationsId.includes(o);
    };

	  // 设置cookie
    // @param {String} key cookie名
    // @param {Object} value cookie值
    // @param {Object} o 自定义参数
	  ctx.setCookie = (key, value, o) => {
	    let options = {
        signed: true,
        httpOnly: true,
        overwrite: true,
        maxAge: cookieConfig.maxAge
      };
	    if(o) {
        options = Object.assign(options, o);
      }
      let valueStr = JSON.stringify(value);
      valueStr = Buffer.from(valueStr).toString("base64");
      ctx.cookies.set(key, valueStr, options);
    };

    // 设置cookie
    // @param {String} key cookie名
    // @param {Object} o 自定义参数
    // @return {Object} cookie值
	  ctx.getCookie = (key, o) => {
      let options = {
        signed: true
      };
      if(o) {
        options = Object.assign(options, o);
      }
      let valueStr;
      try {
        valueStr = ctx.cookies.get(key, options);
        valueStr = Buffer.from(valueStr, "base64").toString();
        return JSON.parse(valueStr);
      } catch(err) {
        return valueStr;
      }
    };

		const reqType = ctx.request.get('REQTYPE');
		if(reqType === 'app') {
			ctx.reqType = 'app';
		}

	  //error handling
    await next();

		if(ctx.data && ctx.data.user && ctx.data.user.toObject) {
			ctx.data.user = ctx.data.user.toObject();
		}
		if(ctx.data && ctx.data.targetUser && ctx.data.targetUser.toObject) {
			ctx.data.targetUser = ctx.data.targetUser.toObject();
		}
  } catch(err) {
	  ctx.status = err.statusCode || err.status || 500;
	  ctx.error = err.stack || err;
	  let error;
	  if(typeof err === 'object'){
		  error = err.message;
	  } else {
		  error = err;
	  }
	  try{
	    const errObj = JSON.parse(error);
	    const {errorType, errorData} = errObj;
	    error = errorData;
	    ctx.errorType = errorType;
    } catch(err) {}
	  if(ctx.errorType) {
	    ctx.template = `error/${ctx.errorType}.pug`;
    } else {
      ctx.template = 'error/error.pug';
    }
    ctx.data.error = error;
	  ctx.data.status = ctx.status;
	  ctx.data.url = ctx.url;
		ctx.type = ctx.type || 'application/json';
		if(ctx.filePath) ctx.filePath = "";
	  await body(ctx, () => {});
  }
  finally {
    // 记录日志
    // 在控制台打印日志
    // 向web后台管理控制台推送日志
    await logger(ctx);
  }
};
