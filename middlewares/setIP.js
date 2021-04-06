const serverConfigs = require('../config/server.json');
module.exports = async (ctx, next) => {
  let ip = ctx.ip;
  let port = ctx.req.connection.remotePort;
  if(serverConfigs.proxy) {
    let xForwardedFor = ctx.get('X-Forwarded-for') || '';
    xForwardedFor =	xForwardedFor.split(',');
    xForwardedFor.push(ip);
    xForwardedFor.reverse();
    const _ip = xForwardedFor[serverConfigs.maxIpsCount - 1];
    ip = _ip || ip;
    port = ctx.get(`X-Forwarded-Remote-Port`) || port;
  }
  ctx.address = ip.replace(/^::ffff:/, '');
  ctx.port = port;
  await next();
};