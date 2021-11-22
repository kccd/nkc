const {
  domain,
} = require('../config/server');
const {fileDownload} = require('../settings/operationsType');
const domainHost = new URL(domain).host;
module.exports = async (ctx, next) => {
  const operationId = ctx.data.operationId;

  if(domainHost !== ctx.host && !fileDownload.includes(operationId)) {
    ctx.status = 404;
    ctx.body = '';
    return;
  }

  await next();
}