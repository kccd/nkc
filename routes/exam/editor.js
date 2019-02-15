const router = new require('koa-router')();
module.exports = router;
router
  .get('/', async (ctx, next) => {
    const {query, data, db} = ctx;
    const {qid} = query;
    ctx.template = 'exam/editor.pug';
    if(qid) {
      if(!ctx.permission('modifyQuestion')) ctx.throw(403, '权限不足');
      data.question = await db.QuestionModel.findOnly({_id: Number(qid)});
    }
    data.qid = Number(qid);
    await next();
  });
