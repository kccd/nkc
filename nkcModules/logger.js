const moment = require('moment');
const languages = require("../languages");
module.exports = async (ctx) => {
  ctx.status = ctx.response.status;
  const passed = Date.now() - ctx.reqTime;
  ctx.set('X-Response-Time', passed);
  const processTime = passed.toString();
  const {
    status = 500, error, method, path, _body, address, port,
    reqTime, data, state, db
  } = ctx;
  const referer = ctx.get("referer");
  const userAgent = ctx.get("User-Agent");
  const {operation, logSettings} = state;
  const operationId = operation._id;
  const {operationsId} = logSettings;
  const log = {
    error,
    method,
    path,
    query: _body,
    status,
    ip: address,
    port: port,
    operationId,
    reqTime,
    processTime,
    referer,
    userAgent,
    uid: data.user? data.user.uid: ""
  };
  // 存入日志
  if(operationsId.includes(operationId)) {
    setImmediate(async () => {
      if(data.user) {
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
    consoleType: "http",
    processId: global.NKC.processId,
    error: log.error,
    from: log.referer,
    address: log.ip,
  };

  const operationName = languages['zh_cn'].operations[operationId] || operationId;

  // （body中间件控制着是否在控制台打印，如果未文件则不打印）
  if(ctx.logIt) {
    if(d.error) {
      // 控制台打印请求记录
      console.error(
        `${moment().format('YYYY/MM/DD HH:mm:ss').grey} `+
        `${(' ' + global.NKC.processId + ' ').grey} `+
        `${' Error '.bgRed} ${log.uid.bgCyan} `+
        `${log.method.green} ${log.path.bgBlue} `+
        `<${processTime.green}ms> `+
        `${String(log.status).red} `+
        `${address} ` +
        `${operationName.grey}`
      );
      // 非线上环境打印错误详细信息
      if (global.NKC.NODE_ENV !== 'production')
        console.error(log.error);
    } else {
      // 控制台打印请求记录
      console.log(
        `${moment().format('YYYY/MM/DD HH:mm:ss').grey} `+
        `${(' ' + global.NKC.processId + ' ').grey} `+
        `${' Info '.bgGreen} `+
        `${log.uid.bgCyan} `+
        `${log.method.green} `+
        `${log.path.bgBlue} `+
        `<${processTime.green}ms> `+
        `${String(log.status).green} `+
        `${address} ` +
        `${operationName.grey}`
      );
    }
    // 网站后台控制台监看请求记录
    ctx.nkcModules.socket.sendConsoleMessage(d);
  }
};
