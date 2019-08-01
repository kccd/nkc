const moment = require('moment');

module.exports = async (ctx) => {
  const processTime = ctx.processTime;
  const {address: ip, port} = ctx;
  const log = {
    error: ctx.error,
    method: ctx.method,
    path: ctx.path,
    query: ctx.query,
    status: ctx.status,
    ip,
    port,
    reqTime: ctx.reqTime,
    processTime,
    uid: ctx.data.user? ctx.data.user.uid : 'visitor'
  };
  const {operationId} = ctx.data;
  const d = {
    url: log.path,
    method: log.method,
    status: log.status,
    uid: log.uid,
    reqTime: log.reqTime,
    resTime: processTime,
    consoleType: 'web',
    processId: global.NKC.processId,
    error: ''
  };
  if(ctx.logIt) {
    d.from = ctx.req.headers.referer;
    d.address = ctx.address;
    let operationName = operationId || '';
    if(ctx.state.lang) {
      operationName = ctx.state.lang('operations', operationId) || '未知操作';
    }
    if (ctx.error) {
      console.error(
        `${moment().format('YYYY/MM/DD HH:mm:ss').grey} ${(' ' + global.NKC.processId + ' ').grey} ${' Error '.bgRed} ${log.uid.bgCyan} ${log.method.black.bgYellow} ${log.path.bgBlue} <${processTime.green}ms> ${String(log.status).red} ${operationName.grey}`
      );
      d.error = ctx.error;
      global.NKC.io.of('/console').NKC.webMessage(d);
      if (global.NKC.NODE_ENV !== 'production')
        console.error(log.error);
    } else {
      console.log(
        `${moment().format('YYYY/MM/DD HH:mm:ss').grey} ${(' ' + global.NKC.processId + ' ').grey} ${' Info '.bgGreen} ${log.uid.bgCyan} ${log.method.black.bgYellow} ${log.path.bgBlue} <${processTime.green}ms> ${String(log.status).green} ${operationName.grey}`
      );
      global.NKC.io.of('/console').NKC.webMessage(d);
    }
  }
};