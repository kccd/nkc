const moment = require('moment');

module.exports = async (ctx) => {
  const {LogModel, OperationModel} = ctx.db;
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
  const operation = await OperationModel.findOne({_id: ctx.data.operationId});
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
    if (ctx.error) {
      console.error(
        `${moment().format('YYYY/MM/DD HH:mm:ss').grey} ${(' ' + global.NKC.processId + ' ').grey} ${' Error '.bgRed} ${log.uid.bgCyan} ${log.method.black.bgYellow} ${log.path.bgBlue} <${processTime.green}ms> ${String(log.status).red} ${(operation?operation.description: '未知操作').grey}`
      );
      d.error = ctx.error
      global.NKC.io.of('/console').NKC.webMessage(d);
      if (global.NKC.NODE_ENV !== 'production')
        console.error(log.error);
    } else {
      console.log(
        `${moment().format('YYYY/MM/DD HH:mm:ss').grey} ${(' ' + global.NKC.processId + ' ').grey} ${' Info '.bgGreen} ${log.uid.bgCyan} ${log.method.black.bgYellow} ${log.path.bgBlue} <${processTime.green}ms> ${String(log.status).green} ${(operation?operation.description: '未知操作').grey}`
      );
      global.NKC.io.of('/console').NKC.webMessage(d);
    }
  }
  // const pathArr = log.path.split('/');
	// const lastPath = pathArr[pathArr.length - 1];
	// let needLog = true;
	// for(let path of excludePath) {
	// 	if(lastPath.includes(path)) {
	// 		needLog = false;
	// 	}
	// }
	// if(pathArr[1] && ['favicon.ico', 'avatar','avatar_small' , 'cover', 'pfa', 'pfb', 'photo', 'photo_small'].includes(pathArr[1])) {
	// 	needLog = false;
	// }
  // if(ctx.status !== 304 && needLog) {
	//   await new LogModel(log).save();
  // }
};