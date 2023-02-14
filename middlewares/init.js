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
const {ErrorTypes} = require('../nkcModules/error');
const {translateResponseType} = require('../nkcModules/translate');
const apiRouteReg = /^\/api\/v[0-9]+/;

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
  // 客户端语言，暂时固定
  ctx.acceptLanguage = 'zh_cn';
  // 是否为API路由
  ctx.isAPIRoute = apiRouteReg.test(ctx.path);
  ctx.acceptJSON =
    ctx.isAPIRoute ||
    (
      ctx.request.accepts('json', 'html') === 'json' &&
      ctx.request.get('FROM') === 'nkcAPI'
    );

  ctx.state = {};

    // 这个字段用于在路由层临时传输数据。
  // 例如在 use('/u/:uid') 中准备好 user 的数据放入 ctx.internalData 中。
  // 然后在 get('/u/:uid') 和 put('/u/:uid') 中使用。
  ctx.internalData = {};

  // 由于历史原因，ctx.data 中包含了很多渲染页面所需要的数据，例如user、userOperations等。
  // 这部分数据可能不是接口所需要的，所以有必要创建一个字段用于返回接口所需要的、干净的数据。
  // 并且需要兼容旧代码，所以最终返回数据时，会优先判断是否走的 /api/.. 路由。
  // 如果走了 /api/.. 则会将 ctx.apiData 字段中的值作为响应数据。
  ctx.apiData = {};

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
    // 错误处理
    // 这里将处理三种类型的错误
    // 1. 自定义响应类型错误 - 抛出错误时需要指定响应类型和类型所需要的参数，最后在翻译组件的帮助下合成错误信息；
    // 2. 定制错误页面 - 抛出错误时需要指定错误页面的名称，最后通过页面渲染合成错误页面；
    // 3. 一般错误 - 抛出错误，根据错误状态码自动匹配错误页面，最后通过页面渲染合成错误页面；

	  ctx.status = err.statusCode || err.status || 500;
	  ctx.error = err.stack || err;
    let errorMessageString = '';

	  if(typeof err === 'object'){
      errorMessageString = err.message;
	  } else {
      errorMessageString = err;
	  }

    let errorData;
    let errorPage;
    let responseType = 'ERROR';

    try{
      const {type, args} = JSON.parse(errorMessageString);

      switch (type) {
        case ErrorTypes.RESPONSE_TYPE: {
          errorData = translateResponseType(ctx.acceptLanguage, args.responseType, args.args);
          responseType = args.responseType;
          break;
        }
        case ErrorTypes.ERROR_PAGE: {
          errorData = args.errorData;
          errorPage = args.errorPage;
          break;
        }
        case ErrorTypes.COMMON: {
          errorData = args.message;
          break;
        }
        default: {
          errorData = errorMessageString;
        }
      }
    } catch(parseError) {
      errorData = errorMessageString;
    }

    errorPage = errorPage || 'error';

    ctx.template = `error/${errorPage}.pug`;

    if(ctx.isAPIRoute) {
      ctx.apiData = {
        code: 0,
        type: responseType,
        message: errorData,
        data: {}
      };
    } else {
      // 出错时的小提示
      ctx.data.errorTips = errorTips;
      // 错误信息，字符串或对象
      ctx.data.error = errorData;
      ctx.data.status = ctx.status;
      ctx.data.url = ctx.url;
    }

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
