const tools = require('../tools');
const settings = require('../settings');
const nkcModules = require('../nkcModules');
const es = settings.elastic;
const db = require('../dataModels');
const {logger} = nkcModules;
const fs = require('fs');
const {promisify} = require('util');
const redis = require('../redis');
const path = require('path');

module.exports = async (ctx, next) => {
	try {
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
      url: ctx.url.replace(/\?.*/ig, "")
    };
    ctx.settings = settings;
	  ctx.data = Object.create(null);
	  ctx.data.site = settings.site;
	  ctx.data.twemoji = settings.editor.twemoji;
		ctx.data.getcode = false;
		const logSettings = await db.SettingModel.findOne({_id: "log"});
		let {operationsId} = logSettings.c;
		ctx.data.logSetting = operationsId;
	  // - 初始化网站设置
		let serverSettings = await db.SettingModel.findOnly({_id: 'server'});
		serverSettings = serverSettings.c;
	  ctx.data.serverSettings = {
			websiteName: serverSettings.websiteName,
			// serverName: serverSettings.serverName.replace('$', global.NKC.NODE_ENV),
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

	  ctx.fs = {
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

	  ctx.permission = (o) => {
	    if(!ctx.data.userOperationsId) ctx.data.userOperationsId = [];
	    return ctx.data.userOperationsId.includes(o);
    };

		Object.defineProperty(ctx, 'template', {
			get: function() {
				return './pages/' + this.__templateFile
			},
			set: function(fileName) {
				this.__templateFile = fileName
			}
		});

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
	  ctx.data.error = error;
	  ctx.data.status = ctx.status;
	  ctx.data.url = ctx.url;
	  ctx.template = 'error.pug';
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