const router = require('koa-router')();
const { OnlyOperation } = require('../../middlewares/permission');
const { Operations } = require('../../settings/operations');
router
  .get(
    '/',
    OnlyOperation(Operations.momentCommentControl),
    async (ctx, next) => {
      const { db, params } = ctx;
      const { mid } = params;
      const moment = await db.MomentModel.findOnly({ _id: mid });
      ctx.data.commentControl = moment.commentControl;
      await next();
    },
  )
  .post(
    '/',
    OnlyOperation(Operations.momentCommentControl),
    async (ctx, next) => {
      const { db, data, params, body, state, permission } = ctx;
      const { comment } = body;
      const { mid } = params;
      if (!['r', 'rw', 'n'].includes(comment)) {
        ctx.throw(400, `参数错误 comment: ${comment}`);
      }
      const moment = await db.MomentModel.findOne({ _id: mid });
      if (!moment) {
        ctx.throw(400, '未找到动态，请刷新');
      }
      await moment.updateOne({
        $set: {
          commentControl: comment,
        },
      });
      await next();
    },
  );
module.exports = router;
