const Router = require('koa-router');
const protocolRouter = new Router();
const nkcRender = require('../../nkcModules/nkcRender');
const { renderHTMLByJSON } = require('../../nkcModules/nkcRender/json');
const { Public } = require('../../middlewares/permission');
protocolRouter.get('/', Public(), async (ctx, next) => {
  const { data, query, db } = ctx;
  const { type } = query;
  data.protocol = await db.ProtocolModel.findOne({ protocolTypeId: type });
  data.protocols = await db.ProtocolModel.find({});
  if (data.protocol) {
    let protocol = data.protocol;
    // 渲染nkcsource
    protocol.protocolContent =
      protocol.l === 'json'
        ? renderHTMLByJSON({
            json: protocol.protocolContent,
            resources: await db.ResourceModel.getResourcesByReference(
              'protocol-' + protocol.protocolTypeId,
            ),
            xsf: data?.user?.xsf,
          })
        : nkcRender.renderHTML({
            type: 'article',
            post: {
              c: protocol.protocolContent,
              resources: await db.ResourceModel.getResourcesByReference(
                'protocol-' + protocol.protocolTypeId,
              ),
            },
            user: data.user,
          });
  }
  ctx.template = 'interface_protocol.pug';
  await next();
});
module.exports = protocolRouter;
