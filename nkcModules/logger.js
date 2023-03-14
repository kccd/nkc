const log4js = require('log4js');

const logger = {
  error,
  info,
  warn,
  debug,
  internalServerError,
  saveLogToDB,
};

const layout = {
  type: 'pattern',
  pattern: '%d{yyyy/MM/dd hh:mm:ss} %x{pid} [%p] %m',
  tokens: {
    pid() {
      return process.pid;
    },
  },
};

log4js.configure({
  pm2: true,
  disableClustering: true,
  appenders: {
    stdout: {
      type: 'stdout',
      layout,
    },
    stderr: {
      type: 'stderr',
      layout,
    },
    common: {
      type: 'file',
      layout,
      filename: 'logs/nkc/all',
      pattern: `yyyy-MM-dd.pid-${process.pid}.log`,
      alwaysIncludePattern: true,
    },
    internalServerError: {
      type: 'file',
      layout,
      filename: 'logs/nkc/error',
      pattern: `yyyy-MM-dd.pid-${process.pid}.log`,
      alwaysIncludePattern: true,
    },
  },
  categories: {
    internalServerError: {
      appenders: ['internalServerError'],
      level: 'trace',
    },
    default: {
      appenders: ['stdout', 'common'],
      level: 'trace',
    },
  },
});

const commonLogger = log4js.getLogger();
const internalServerErrorLogger = log4js.getLogger('internalServerError');

async function saveLogToDB(ctx) {
  ctx.status = ctx.response.status;
  const passed = Date.now() - ctx.reqTime;
  ctx.set('X-Response-Time', passed);
  const processTime = passed.toString();
  const {
    status = 500,
    error,
    method,
    path,
    _body,
    address,
    port,
    reqTime,
    data,
    state,
    db,
    url,
  } = ctx;

  const referer = ctx.get('referer');
  const userAgent = ctx.get('User-Agent');
  const { operation, logSettings } = state;
  const operationId = operation._id;
  const { operationsId } = logSettings;
  const log = {
    error,
    method,
    path: global.NKC.isProduction ? path : url,
    query: _body,
    status,
    ip: address,
    port: port,
    operationId,
    reqTime,
    processTime,
    referer,
    userAgent,
    uid: data.user ? data.user.uid : '',
  };
  // 存入日志
  if (operationsId.includes(operationId)) {
    setImmediate(async () => {
      if (data.user) {
        await db.LogModel(log).save();
      } else {
        await db.VisitorLogModel(log).save();
      }
    });
  }
  const d = {
    url: log.path,
    method: log.method,
    status: log.status,
    uid: log.uid,
    reqTime: log.reqTime,
    resTime: log.processTime,
    consoleType: 'http',
    processId: global.NKC.processId,
    error: log.error,
    from: log.referer,
    address: log.ip,
  };

  // （body中间件控制着是否在控制台打印，如果未文件则不打印）
  if (ctx.logIt) {
    const logContent =
      (log.uid || 'visitor') +
      ' ' +
      log.method +
      ' ' +
      log.path +
      ' ' +
      '<' +
      processTime +
      'ms> ' +
      log.status +
      ' ' +
      address +
      ' ' +
      operationId +
      ' ';
    if (d.error) {
      logger.error(logContent);
      // 非线上环境打印错误详细信息
      if (global.NKC.NODE_ENV !== 'production') {
        console.error(log.error);
      }
    } else {
      logger.info(logContent);
    }

    if (log.status === 500) {
      internalServerError(`${logContent} \n ${log.error}`);
    }
  }
  // 统计请求
  try {
    const redisKey = ctx.nkcModules.getRedisKeys(
      'operationStatistics',
      operationId,
    );
    let operationStatistics = await ctx.settings.redisClient.getAsync(redisKey);
    if (!operationStatistics) {
      operationStatistics = [operationId, 0, 0, null, null]; // 「操作名，次数，总耗时，最大耗时，最小耗时」
    } else {
      operationStatistics = JSON.parse(operationStatistics);
    }
    operationStatistics[1]++;
    operationStatistics[2] += passed;
    if (operationStatistics[3] === null || passed > operationStatistics[3]) {
      operationStatistics[3] = passed;
    }
    if (operationStatistics[4] === null || passed < operationStatistics[4]) {
      operationStatistics[4] = passed;
    }
    await ctx.settings.redisClient.setAsync(
      redisKey,
      JSON.stringify(operationStatistics),
    );
  } catch (err) {
    if (global.NKC.isDevelopment) {
      console.log(err);
    }
  }
}

function internalServerError(content) {
  internalServerErrorLogger.error(content);
}

function debug(content) {
  commonLogger.debug(content);
}

function info(content) {
  commonLogger.info(content);
}

function error(content) {
  if (typeof content === 'object') {
    content = content.stack || content.toString();
  }
  commonLogger.error(content);
}

function warn(content) {
  commonLogger.warn(content);
}

module.exports = logger;
