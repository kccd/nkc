module.exports = async ctx => {
  const logModel = ctx.db.logModel;
  const processTime = ctx.processTime;
  const log = {
    error: ctx.error,
    method: ctx.method,
    path: ctx.path,
    query: ctx.query,
    status: ctx.status,
    ip: ctx.ip,
    port: ctx.request.host.split(':')[1],
    reqTime: ctx.reqTime,
    processTime
  };
  if(ctx.user) {
    log.uid = user.uid;
  }
  else {
    log.uid = 'visitor';
  }

  if(ctx.error) {
    console.error(
      ' Error '.bgRed + ` ${log.reqTime.toLocaleTimeString().grey} ${log.uid.bgCyan} ${log.method.black.bgYellow} ${log.path.bgBlue} <${processTime.green}ms> ${String(log.status).red}`
    )
  }
  else {
    console.log(
      ' Info '.bgGreen + ` ${log.reqTime.toLocaleTimeString().grey} ${log.uid.bgCyan} ${log.method.black.bgYellow} ${log.path.bgBlue} <${processTime.green}ms> ${String(log.status).green}`
    )
  }
};