const nkcModules = require("../nkcModules");
module.exports = async (ctx, next) => {
  const {ip, port} = nkcModules.getRealIP({
    remoteIp: ctx.ip,
    remotePort: ctx.req.connection.remotePort,
    xForwardedFor: ctx.get('x-forwarded-for'),
    xForwardedRemotePort: ctx.get(`x-forwarded-remote-port`)
  });
  ctx.address = ip;
  ctx.port = port;
  await next();
}