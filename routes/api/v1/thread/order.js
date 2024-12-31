const Router = require('koa-router');
const { Public, OnlyOperation } = require('../../../../middlewares/permission');
const { Operations } = require('../../../../settings/operations');
const router = new Router();

router
  .get('/', Public(), async (ctx, next) => {
    const { params, db } = ctx;
    const { tid } = params;
    const { toc, ttoc, tlm } = await db.ThreadModel.findOnly(
      { tid },
      { ttoc: 1, tlm: 1, toc: 1 },
    );
    const latestPost = await db.PostModel.findOne(
      {
        tid,
        type: 'post',
        disabled: false,
        reviewed: true,
        toDraft: { $ne: true },
        parentPostId: '',
      },
      { toc: 1 },
    ).sort({ toc: -1 });

    ctx.apiData = {
      ttoc,
      tlm,
      ttocDefault: toc,
      tlmDefault: latestPost ? latestPost.toc : toc,
    };

    await next();
  })
  .put('/', OnlyOperation(Operations.modifyThreadOrder), async (ctx, next) => {
    const { body, db, params } = ctx;
    const { tid } = params;
    const { ttoc, tlm } = body;

    if (isNaN(ttoc) || ttoc < 0) {
      ctx.throw(400, '贴序时间格式错误');
    }

    if (isNaN(tlm) || tlm < 0) {
      ctx.throw(400, '复序时间格式错误');
    }

    await db.ThreadModel.updateOne(
      {
        tid,
      },
      {
        $set: {
          ttoc,
          tlm,
        },
      },
    ).sort({ toc: -1 });

    ctx.apiData = {
      ttoc,
      tlm,
    };

    await next();
  });

module.exports = router;
