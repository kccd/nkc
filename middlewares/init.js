const tools = require('../tools');
const settings = require('../settings');
const nkcModules = require('../nkcModules');
const es = settings.elastic;
const db = require('../dataModels');
const {logger} = nkcModules;
const fs = require('fs');
const {promisify} = require('util');

module.exports = async (ctx, next) => {
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

  ctx.print = (value1, value2) => {
    if(value2 !== undefined){
      console.log(`---------------------${value1}-------------------------`);
      console.log(value2);
    } else {
      console.log(`--------------------------------------------------------`);
      console.log(value1);
    }
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
  try {
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