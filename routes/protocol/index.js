const Router = require('koa-router');
const protocolRouter = new Router();
const nkcModules = require('../../nkcModules');

protocolRouter
  .get('/', async (ctx, next) => {
    const {data, query, db} = ctx;
    const {type} = query;
    data.protocol = await db.ProtocolModel.findOne({protocolTypeId: type});
    data.protocols = await db.ProtocolModel.find({});
    ctx.template = 'interface_protocol.pug';
    await next();
  })
module.exports = protocolRouter;
