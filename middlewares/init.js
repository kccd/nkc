const tools = require('../tools');
const settings = require('../settings');
const nkcModules = require('../nkcModules');
const es = settings.elastic;
const db = require('../dataModels');
const {logger} = nkcModules;
const fs = require('fs');
const {promisify} = require('util');

module.exports = async (ctx, next) => {
  ctx.port = ctx.request.socket._peername.port;
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
    createReadStream: fs.createReadStream
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
    ctx.error = err.stack;
    ctx.status = err.statusCode || err.status || 500;
/*    if(process.ENV === 'production')
      ctx.data.message = err.message;
    else
      ctx.data.message = err.message;//String(err.stack).replace(/(>?\s\d+\|)/g, '<br />$1')*/
    const type = ctx.request.accepts('json', 'html');
    let error = err;
    if(typeof err === 'object'){
      error = err.message;
    }
    if(type === 'html') {
      ctx.data.message = err;
    } else {
      ctx.data = error;
    }
    if(ctx.status === 404) {
      ctx.template = '404.pug';
    } else {
      ctx.template = '500.pug';
    }
    const text = function(){};
    await body(ctx, text);
  }
  finally {
    ctx.status = ctx.response.status;
    const passed = Date.now() - ctx.reqTime;
    ctx.set('X-Response-Time', passed);
    ctx.processTime = passed.toString();
    await logger(ctx);
  }
};