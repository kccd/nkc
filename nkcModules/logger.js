// const excludePath = ['.js', '.css', '.svg', '.png', '.jpg', '.woff2', '.woff', '.eot'];
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
  if(ctx.logIt) {
    if (ctx.error) {
      console.error(
        ' Error '.bgRed + ` ${log.reqTime.toLocaleTimeString().grey} ${log.uid.bgCyan} ${log.method.black.bgYellow} ${log.path.bgBlue} <${processTime.green}ms> ${String(log.status).red} ${(operation?operation._id + ' ' + operation.description: '未知操作')}`
      );
      if (global.NKC.NODE_ENV !== 'production')
        console.error(log.error);
    } else {
      console.log(
        ' Info '.bgGreen + ` ${log.reqTime.toLocaleTimeString().grey} ${log.uid.bgCyan} ${log.method.black.bgYellow} ${log.path.bgBlue} <${processTime.green}ms> ${String(log.status).green} ${(operation?operation._id + ' ' + operation.description: '未知操作')}`
      );
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