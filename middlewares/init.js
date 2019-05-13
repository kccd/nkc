const tools = require('../tools');
const settings = require('../settings');
const nkcModules = require('../nkcModules');
const es = settings.elastic;
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
	try {
    ctx.data = Object.create(null);
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
	  ctx.reqTime = new Date();
	  ctx.db = db;
	  ctx.nkcModules = nkcModules;
	  ctx.tools = tools;
	  ctx.redis = redis;
    ctx.state = {
      url: ctx.url.replace(/\?.*/ig, ""),
    };
    ctx.settings = settings;
	  ctx.data.site = settings.site;
	  ctx.data.twemoji = settings.editor.twemoji;
		ctx.data.getcode = false;
	  // - 初始化网站设置
    const webSettings = await db.SettingModel.find({_id: {$in: ['server', 'page']}});
    let serverSettings, pageSettings;
    for(const s of webSettings) {
      if(s._id === "server") serverSettings = s.c;
      if(s._id === "page") pageSettings = s.c;
    }
    ctx.state.pageSettings = pageSettings;
	  ctx.data.serverSettings = {
			websiteName: serverSettings.websiteName,
		  github: serverSettings.github,
		  copyright: serverSettings.copyright,
		  record: serverSettings.record,
		  description: serverSettings.description,
		  keywords: serverSettings.keywords,
		  brief: serverSettings.brief,
		  telephone: serverSettings.telephone,
      links: serverSettings.links
	  };

	  ctx.es = es;

	  ctx.fs = fsSync;

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

	  // 抛出错误，指定前端错误页面模板
    // @param {Number} status 状态码
    // @param {String} message 错误信息
    // @param {String} type 错误类型
	  ctx.throwError = (status, message, type) => {
      ctx.errorType = type;
      ctx.throw(status, message);
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