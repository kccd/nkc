module.exports = async ctx => {
  const logModel = ctx.db.logModel;
  const log = {
    error: ctx.error,
    method: ctx.method,
    path: ctx.path,
    query: ctx.query,
    status: ctx.status,
    ip: ctx.ip,
    port: ctx.request.host.split(':')[1],
    reqTime: ctx.reqTime,
    resTime: ctx.get('X-Response-Time')
  };
  if(ctx.user) {
    log.uid = user.uid;
  }
  else {
    log.uid = 'visitor';
  }

  if(ctx.error) {
    console.error(
      ' Error '.bgRed + ` ${log.reqTime.toLocaleString().grey} ${log.uid.bgCyan} ${log.method.black.bgYellow} ${log.path.bgBlue} => ${log.status.red}`
    )
  }
  else {
    console.log(
      ' Info '.bgGreen + ` ${log.reqTime.toLocaleString().grey} ${log.uid.bgCyan} ${log.method.black.bgYellow} ${log.path.bgBlue} => ${log.status.green}`
    )
  }
};