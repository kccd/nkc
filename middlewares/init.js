const tools = require('../tools');
const settings = require('../settings');
const nkcModules = require('../nkcModules');
const es = settings.elastic;
const db = require('../dataModels');
const {logger} = nkcModules;
const fs = require('fs');
const {promisify} = require('util');

module.exports = async (ctx, next) => {
	try {
	  let {remoteAddress: ip, remotePort: port} = ctx.req.connection;
	  const XFF = ctx.get('X-Forwarded-For');
	  if(XFF !== '')
	    [ip, port] = XFF.split(':');
	  ctx.address = ip;
	  ctx.port = port;
	  ctx.reqTime = new Date();
	  ctx.db = db;
	  ctx.nkcModules = nkcModules;
	  ctx.tools = tools;
	  ctx.settings = settings;
	  ctx.data = Object.create(null);
	  ctx.data.site = settings.site;
	  ctx.data.twemoji = settings.editor.twemoji;
		ctx.data.getcode = false;
		let {operationsId} = await db.SettingModel.findOne({"type":"log"})
		ctx.data.logSetting = operationsId
	  // - 初始化网站设置
		const serverSettings = await db.SettingModel.findOnly({type: 'server'});

	  ctx.data.serverSettings = {
			websiteName: serverSettings.websiteName,
			serverName: serverSettings.serverName,
		  github: serverSettings.github,
		  copyright: serverSettings.copyright,
		  record: serverSettings.record,
		  description: serverSettings.description,
		  keywords: serverSettings.keywords,
		  brief: serverSettings.brief,
		  telephone: serverSettings.telephone
	  };

	  ctx.es = es;

	  ctx.fs = {
	    access: promisify(fs.access),
	    unlink: promisify(fs.unlink),
	    rename: promisify(fs.rename),
	    writeFile: promisify(fs.writeFile),
	    mkdir: promisify(fs.mkdir),
	    exists: promisify(fs.exists),
	    createReadStream: fs.createReadStream,
	    stat: promisify(fs.stat),
		  copyFile: promisify(fs.copyFile)
	  };

		Object.defineProperty(ctx, 'template', {
			get: function() {
				return './pages/' + this.__templateFile
			},
			set: function(fileName) {
				this.__templateFile = fileName
			}
		});
	  //error handling
    await next();
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