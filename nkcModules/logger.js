module.exports = async (ctx) => {
  const {LogModel} = ctx.db;
  const processTime = ctx.processTime;
  const {address, port} = ctx.request.socket._peername;
  const log = {
    error: ctx.error,
    method: ctx.method,
    path: ctx.path,
    query: ctx.query,
    status: ctx.status,
    ip: address,
    port,
    reqTime: ctx.reqTime,
    processTime,
    uid: ctx.data.user? ctx.data.user.uid : 'visitor'
  };
  if(ctx.error) {
    console.error(
      ' Error '.bgRed + ` ${log.reqTime.toLocaleTimeString().grey} ${log.uid.bgCyan} ${log.method.black.bgYellow} ${log.path.bgBlue} <${processTime.green}ms> ${String(log.status).red}`
    );
    if(process.env !== 'production')
      console.error(log.error);
  }
  else {
    console.log(
      ' Info '.bgGreen + ` ${log.reqTime.toLocaleTimeString().grey} ${log.uid.bgCyan} ${log.method.black.bgYellow} ${log.path.bgBlue} <${processTime.green}ms> ${String(log.status).green}`
    );
  }
};