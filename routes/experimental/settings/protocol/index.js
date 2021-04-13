const Router = require('koa-router');
const protocolRouter = new Router();
const nkcRender = require('../../../../nkcModules/nkcRender');


protocolRouter
  .use('/', async (ctx, next) => {
    const {data, db} = ctx;
    data.protocols = await db.ProtocolModel.find({});
    await next();
  })
  .get('/', async (ctx, next) => {
    const {data, db, query} = ctx;
    data.type = "add";
    ctx.template = 'experimental/settings/protocol.pug';
    await next();
  })
  // 后台查看协议
  .get('/:type', async (ctx, next) => {
    const {data, db, query, params} = ctx;
    const {type} = params;
    const {visitType} = query;
    data.type = type;
    data.visitType = visitType;
    const protocol = await db.ProtocolModel.findOne({protocolTypeId: type});
    // 渲染nkcsource
    if(data.visitType !== "update") {
      protocol.protocolContent = nkcRender.renderHTML({
        type: "article",
        post: {
          c: protocol.protocolContent,
          resources: await db.ResourceModel.getResourcesByReference("protocol-"+ protocol.protocolTypeId)
        },
        user: data.user
      });
    }
    data.protocol = protocol;
    ctx.template = 'experimental/settings/protocol.pug';
    await next();
  })
  // 后台更新协议
  .put('/:type', async (ctx, next) => {
    const {data, db, body} = ctx;
    let {id, protocolName, protocolTypeId, protocolTypeName, protocolContent} = body;
    if(!protocolName) ctx.throw(400, "未填写协议名称");
    if(!protocolTypeId) ctx.throw(400, "未填写协议类型ID");
    if(!protocolTypeName) ctx.throw(400, "未填写协议类型名称");
    if(!protocolContent) ctx.throw(400, "未填写协议内容");
    const protocol = await db.ProtocolModel.findOne({protocolTypeId: id});
    // 富文本内容中每一个source添加引用
    await db.ResourceModel.toReferenceSource("protocol-" + protocolTypeId, protocolContent);
    await protocol.updateOne({$set: {
      protocolName,
      protocolTypeId,
      protocolTypeName,
      protocolContent
    }});
    data.protocolTypeId = protocolTypeId;
    await next();
  })
  // 后台删除协议
  .post('/:type', async (ctx, next) => {
    const {data, db, body} = ctx;
    const {id} = body;
    const protocol = await db.ProtocolModel.findOne({protocolTypeId: id});
    if(!protocol) ctx.throw(400, "当前协议已被删除");
    await protocol.deleteOne();
    await next();
  })
  // 后台更新协议
  .post('/', async (ctx, next) => {
    const {data, db, body} = ctx;
    let {protocolName, protocolTypeId, protocolTypeName, protocolContent} = body;
    if(!protocolName) ctx.throw(400, "未填写协议名称");
    if(!protocolTypeId) ctx.throw(400, "未填写协议类型ID");
    if(!protocolTypeName) ctx.throw(400, "未填写协议类型名称");
    if(!protocolContent) ctx.throw(400, "未填写协议内容");
    // 判断该类型是否已经存在
    let protocol = await db.ProtocolModel.findOne({protocolTypeId});
    if(protocol) ctx.throw("400", `类型为${protocolTypeId}的协议已存在`);
    // 富文本内容中每一个source添加引用
    await db.ResourceModel.toReferenceSource("protocol-" + protocolTypeId, protocolContent);
    protocol = db.ProtocolModel({
      protocolName,
      protocolTypeId,
      protocolTypeName,
      protocolContent
    });
    await protocol.save();
    data.protocolTypeId = protocolTypeId;
    await next();
  });
module.exports = protocolRouter;
