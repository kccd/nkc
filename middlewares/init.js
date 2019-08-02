const tools = require('../tools');
const colors = require("colors");
const settings = require('../settings');
const nkcModules = require('../nkcModules');
const db = require('../dataModels');
const {logger} = nkcModules;
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
  try{
    ctx.data.operationId = nkcModules.permission.getOperationId(ctx.url, ctx.method);
  } catch(err) {
    if(err.status === 404) {
      console.log(`未知来源的请求：${ctx.url}`.bgRed);
    } else {
      console.log(err);
    }
    return;
  }
  try {
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
      [ip_] = XFF.split(':');
      if(ip_) ip = ip_;
    }
	  ctx.address = ip;
	  ctx.port = port;
    ctx.body = ctx.request.body;
	  ctx.db = db;
	  ctx.nkcModules = nkcModules;
	  ctx.tools = tools;
    ctx.redis = redis;
    ctx.settings = settings;
    ctx.fs = fsSync;

    ctx.state = {
      url: ctx.url.replace(/\?.*/ig, ""),
      apptype: (ctx.query.apptype && ctx.query.apptype === "app")?"app":"",
      twemoji: settings.editor.twemoji,

      // - 初始化网站设置
      pageSettings: await db.SettingModel.getSettings("page"),
      postSettings: await db.SettingModel.getSettings("post"),
      serverSettings: await db.SettingModel.getSettings("server")
    };

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
      try {
        let valueStr = ctx.cookies.get(key, options);
        valueStr = Buffer.from(valueStr, "base64").toString();
        value = JSON.parse(valueStr);
        return value;
      } catch(err) {
        if(global.NKC.NODE_ENV !== "production") {
          console.log(err);
        }
        return null
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
    const body = require('./body');
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
	  await body(ctx, () => {});
  }
  finally {
    ctx.status = ctx.response.status;
    const passed = Date.now() - ctx.reqTime;
    ctx.set('X-Response-Time', passed);
    ctx.processTime = passed.toString();
    await logger(ctx);
  }
};