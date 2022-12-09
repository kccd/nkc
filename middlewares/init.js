const tools = require('../tools');
const body = require('./body');
const settings = require('../settings');
const nkcModules = require('../nkcModules');
const db = require('../dataModels');
const {logger} = nkcModules;
const fs = require('fs');
const fsPromise = fs.promises;
const redis = require('../redis');
const errorTips = require('../config/errorTips.json');
const {getErrorPage404, getErrorPage500} = require('../nkcModules/errorPage');

const fsSync = {
  access: fsPromise.access,
  unlink: fsPromise.unlink,
  rename: fsPromise.rename,
  writeFile: fsPromise.writeFile,
  mkdir: fsPromise.mkdir,
  exists: fsPromise.exists,
  existsSync: fs.existsSync,
  copyFile: fsPromise.copyFile,
  createReadStream: fs.createReadStream,
  createWriteStream: fs.createWriteStream,
  stat: fsPromise.stat
};

module.exports = async (ctx, next) => {
  ctx.reqTime = new Date();
  ctx.data = Object.create(null);
  ctx.nkcModules = nkcModules;
  ctx.state = {};

  try{
    ctx.data.operationId = nkcModules.permission.getOperationId(ctx.url, ctx.method);
  } catch(err) {
    ctx.status = err.status;
    if(err.status === 404) {
      ctx.body = getErrorPage404(ctx.url);
      console.log(`未知请求：${ctx.address} ${ctx.method} ${ctx.url}`.bgRed);
    } else {
      ctx.body = getErrorPage500(ctx.url, err.message);
      console.log(`内部错误：${err.message} ${ctx.address} ${ctx.method} ${ctx.url}`.bgRed);
    }
    return;
  }

  try {
    ctx.internalData = {};
    ctx.body = ctx.request.body;
    ctx.db = db;
	  ctx.tools = tools;
    ctx.redis = redis;
    ctx.settings = settings;
    ctx.fs = fsSync;
    ctx.fsPromise = fsPromise;

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
	    if(errorType) {
        error = errorData;
        ctx.errorType = errorType;
      }
    } catch(err) {}
	  if(ctx.errorType) {
	    ctx.template = `error/${ctx.errorType}.pug`;
    } else {
      ctx.template = 'error/error.pug';
    }
    ctx.data.errorTips = errorTips;
    ctx.data.error = error;
	  ctx.data.status = ctx.status;
	  ctx.data.url = ctx.url;
		ctx.type = ctx.type || 'application/json';
		if(ctx.filePath) ctx.filePath = "";
    if(ctx.remoteFile) ctx.remoteFile = null;
    if(ctx.remoteTemplate) ctx.remoteTemplate = '';
	  await body(ctx, () => {});
  }
  finally {
    // 记录日志
    // 在控制台打印日志
    // 向web后台管理控制台推送日志
    await logger(ctx);
  }
};
