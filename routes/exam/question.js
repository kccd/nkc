const Router = require('koa-router');
const {
  Public,
  OnlyOperation,
  OnlyUnbannedUser,
} = require('../../middlewares/permission');
const { Operations } = require('../../settings/operations');
const router = new Router();
router
  .get('/:_id/image', Public(), async (ctx, next) => {
    const { params, db, settings } = ctx;
    const { _id } = params;
    const question = await db.QuestionModel.findOnly({ _id });
    ctx.filePath =
      settings.upload.questionImagePath + '/' + question._id + '.jpg';
    ctx.set('Cathe-Control', `public, max-age=${settings.cache.maxAge}`);
    ctx.type = 'jpg';
    await next();
  })
  .del('/:_id', OnlyUnbannedUser(), async (ctx, next) => {
    const { params, db, data } = ctx;
    const { user } = data;
    const { _id } = params;
    const question = await db.QuestionModel.findOnly({ _id });
    if (question.uid !== user.uid && !ctx.permission('removeAllQuestion')) {
      ctx.throw(403, '仅能删除自己的且未能通过审核的试题');
    }
    if (question.auth !== false) {
      ctx.throw(400, '只能删除未通过审核的试题');
    }
    await question.deleteOne();
    await next();
  })
  .post(
    '/:_id/disabled',
    OnlyOperation(Operations.disabledQuestion),
    async (ctx, next) => {
      const { db, params, body, tools } = ctx;
      const { contentLength } = tools.checkString;
      const { _id } = params;
      const { reason } = body;
      if (!reason) {
        ctx.throw(400, '原因不能为空');
      }
      if (contentLength(reason) > 500) {
        ctx.throw(400, '原因字数不能超过500');
      }
      const question = await db.QuestionModel.findOnly({ _id });
      await question.updateOne({ disabled: true, reason });
      await next();
    },
  )
  .del(
    '/:_id/disabled',
    OnlyOperation(Operations.enabledQuestion),
    async (ctx, next) => {
      const { db, params } = ctx;
      const { _id } = params;
      const question = await db.QuestionModel.findOnly({ _id });
      await question.updateOne({ disabled: false });
      await next();
    },
  )
  .put(
    '/:_id/auth',
    OnlyOperation(Operations.modifyQuestionAuthStatus),
    async (ctx, next) => {
      const { db, body, params } = ctx;
      const { _id } = params;
      const { auth } = body;
      if (auth === null) {
        await db.QuestionModel.updateOne(
          {
            _id,
          },
          {
            $set: {
              auth: null,
            },
          },
        );
      }
      await next();
    },
  );
module.exports = router;
