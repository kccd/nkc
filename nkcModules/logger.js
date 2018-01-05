module.exports = async (ctx) => {
  const {LogModel} = ctx.db;
  const processTime = ctx.processTime;
  const {ip, port} = ctx;
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
  if(ctx.logIt)
    if(ctx.error) {
      console.error(
        ' Error '.bgRed + ` ${log.reqTime.toLocaleTimeString().grey} ${log.uid.bgCyan} ${log.method.black.bgYellow} ${log.path.bgBlue} <${processTime.green}ms> ${String(log.status).red}`
      );
      if(process.env.NODE_ENV !== 'production')
        console.error(log.error);
    }
    else {
      console.log(
        ' Info '.bgGreen + ` ${log.reqTime.toLocaleTimeString().grey} ${log.uid.bgCyan} ${log.method.black.bgYellow} ${log.path.bgBlue} <${processTime.green}ms> ${String(log.status).green}`
      );
    }
  await new LogModel(log).save()
};