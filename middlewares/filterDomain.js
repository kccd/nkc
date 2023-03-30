const { domain, reserveDomain = [] } = require('../config/server');
const { fileDownload } = require('../settings/operationsType');
const { isProduction } = require('../settings/env');
const domainHost = new URL(domain).host;
const reserveDomainHost = reserveDomain.map((d) => new URL(d).host);
module.exports = async (ctx, next) => {
  const operationId = ctx.data.operationId;

  if (
    isProduction &&
    domainHost !== ctx.host &&
    !reserveDomainHost.includes(ctx.host) &&
    !fileDownload.includes(operationId)
  ) {
    ctx.status = 404;
    ctx.body = '';
    return;
  }

  await next();
};
