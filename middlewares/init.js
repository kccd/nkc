const tools = require('../tools');
const body = require('./body');
const settings = require('../settings');
const nkcModules = require('../nkcModules');
const db = require('../dataModels');
const {logger} = nkcModules;
const fs = require('fs');
const fsPromise = fs.promises;
const path = require('path');
const redis = require('../redis');
const cookieConfig = require("../config/cookie");
const {fileDomain} = require("../config/server");
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

  let cookieDomain = '';
  try{
    cookieDomain = nkcModules.domain.getRootDomainByHost(ctx.host);
  } catch(err) {
    if(global.NKC.isDevelopment) {
      console.log(err);
    }
  }

  const {ip, port} = nkcModules.getRealIP({
    remoteIp: ctx.ip,
    remotePort: ctx.req.connection.remotePort,
    xForwardedFor: ctx.get('x-forwarded-for'),
    xForwardedRemotePort: ctx.get(`x-forwarded-remote-port`)
  });
  ctx.address = ip;
  ctx.port = port;
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
      operation: await db.OperationModel.getOperationById(ctx.data.operationId),
      // - 初始化网站设置
      pageSettings: await db.SettingModel.getSettings("page"),
      postSettings: await db.SettingModel.getSettings("post"),
      serverSettings: await db.SettingModel.getSettings("server"),
      stickerSettings: await db.SettingModel.getSettings("sticker"),
      logSettings: await db.SettingModel.getSettings("log"),
      threadSettings: await db.SettingModel.getSettings('thread'),
      // 缓存相关
      cachePage: false,
      // 获取app稳定版本
      appStableVersion: await db.AppVersionModel.findOne({
        appPlatForm: "android",
        stable: true,
        disabled: false
      }),
      fileDomain: fileDomain || ''
    };

    // 下载附件是否需要积分
    ctx.state.downloadNeedScore = await db.ScoreOperationModel.downloadNeedScore();
    ctx.state.threadListStyle = Object.assign({}, ctx.state.pageSettings.threadListStyle);

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
	  /*// 权限判断
    // @param {String} o 操作名
	  ctx.permission = (o) => {
	    if(!ctx.data.userOperationsId) ctx.data.userOperationsId = [];
	    return ctx.data.userOperationsId.includes(o);
    };
    //权限判断 or
    ctx.permissionsOr = (o) => {
      for(const i of o) {
        if(ctx.permission(i)) {
          return true;
        }
      }
      return false;
    }*/

	  // 设置cookie
    // @param {String} key cookie名
    // @param {Object} value cookie值
    // @param {Object} o 自定义参数
	  /*ctx.setCookie = (key, value, o) => {
	    let options = {
        signed: true,
        httpOnly: true,
        overwrite: true,
        maxAge: cookieConfig.maxAge,
      };
      if(cookieDomain) {
        options.domain = cookieDomain;
      }
	    if(o) {
        options = Object.assign(options, o);
      }
      let valueStr = JSON.stringify(value);
      valueStr = Buffer.from(valueStr).toString("base64");
      ctx.cookies.set(key, valueStr, options);
    };

    ctx.clearCookie = (key) => {
      let options = {
        signed: true,
        httpOnly: true,
        overwrite: true,
        maxAge: 0,
      };
      if(cookieDomain) {
        options.domain = cookieDomain;
      }
      ctx.cookies.set(key, '', options);
    }

    // 设置cookie
    // @param {String} key cookie名
    // @param {Object} o 自定义参数
    // @return {Object} cookie值
	  ctx.getCookie = (key, o) => {
      let options = {
        signed: true,
      };
      if(cookieDomain) {
        options.domain = cookieDomain;
      }
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
    };*/

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
