const Router = require('koa-router');
const protocolRouter = new Router();
protocolRouter
  .use('/', async (ctx, next) => {
    const {data, db} = ctx;
    const protocols = await db.ProtocolModel.find({});
    data.protocols = protocols;
    await next();
  })
  .get('/', async (ctx, next) => {
    const {data, db, query} = ctx;
    data.type = "add";
    ctx.template = 'experimental/settings/protocol.pug';
    await next();
  })
  .get('/:type', async (ctx, next) => {
    const {data, db, query, params} = ctx;
    const {type} = params;
    const {visitType} = query;
    data.type = type;
    data.visitType = visitType;
    const protocol = await db.ProtocolModel.findOne({protocolTypeId: type});
    data.protocol = protocol;
    ctx.template = 'experimental/settings/protocol.pug';
    await next();
  })
  .patch('/:type', async (ctx, next) => {
    const {data, db, body} = ctx;
    const {id, protocolName, protocolTypeId, protocolTypeName, protocolContent} = body;
    if(!protocolName) ctx.throw(400, "未填写协议名称");
    if(!protocolTypeId) ctx.throw(400, "未填写协议类型ID");
    if(!protocolTypeName) ctx.throw(400, "未填写协议类型名称");
    if(!protocolContent) ctx.throw(400, "未填写协议内容");
    const protocol = await db.ProtocolModel.findOne({protocolTypeId: id});
    await protocol.update({$set: {
      protocolName,
      protocolTypeId,
      protocolTypeName,
      protocolContent
    }});
    data.protocolTypeId = protocolTypeId;
    await next();
  })
  .post('/:type', async (ctx, next) => {
    const {data, db, body} = ctx;
    const {id} = body;
    const protocol = await db.ProtocolModel.findOne({protocolTypeId: id});
    if(!protocol) ctx.throw(400, "当前协议已被删除");
    await protocol.remove();
    await next();
  })
  .post('/', async (ctx, next) => {
    const {data, db, body} = ctx;
    const {protocolName, protocolTypeId, protocolTypeName, protocolContent} = body;
    if(!protocolName) ctx.throw(400, "未填写协议名称");
    if(!protocolTypeId) ctx.throw(400, "未填写协议类型ID");
    if(!protocolTypeName) ctx.throw(400, "未填写协议类型名称");
    if(!protocolContent) ctx.throw(400, "未填写协议内容");
    // 判断该类型是否已经存在
    let protocol = await db.ProtocolModel.findOne({protocolTypeId});
    if(protocol) ctx.throw("400", `类型为${protocolTypeId}的协议已存在`);
    protocol = db.ProtocolModel({
      protocolName, 
      protocolTypeId,
      protocolTypeName,
      protocolContent
    })
    await protocol.save();
    data.protocolTypeId = protocolTypeId;
    await next();
  })
module.exports = protocolRouter;