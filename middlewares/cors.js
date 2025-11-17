const cors = require('@koa/cors');
const serverConfig = require('../config/server');

function normalizeOrigin(origin) {
  if (!origin) {
    return null;
  }
  origin = origin.trim();
  if (origin.endsWith('/')) {
    origin = origin.slice(0, -1);
  }
  return origin;
}

// 构建白名单集合（只在初始化时处理一次）
const allowedOriginsSet = new Set(
  [serverConfig.domain, serverConfig.fileDomain]
    .filter(Boolean)
    .map(normalizeOrigin),
);

module.exports = cors({
  origin: (ctx) => {
    const rawOrigin = ctx.get('origin');
    if (!rawOrigin) {
      // 同源请求无需添加 CORS 头，返回 false
      return false;
    }
    const origin = normalizeOrigin(rawOrigin);
    if (allowedOriginsSet.has(origin)) {
      return origin;
    }
    return false;
  },
  credentials: true,
  allowMethods: ['GET', 'HEAD', 'OPTIONS', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization', 'FROM'],
});
