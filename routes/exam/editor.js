const router = new require('koa-router')();
module.exports = router;
router
  .get('/', async (ctx, next) => {
    const {query, data, db} = ctx;
    const {cid, qid} = query;
    if(ctx.get('FROM') !== 'nkcAPI') {
      const categoryCount = await db.ExamsCategoryModel.count();
      if(categoryCount === 0) ctx.throw(403, '考试功能暂未开放');
      ctx.template = 'exam/editor.pug';
      return await next();
    }
    if(qid) {
      if(!ctx.permission('modifyQuestion')) ctx.throw(403, '权限不足');
      console.log(qid)
      data.question = await db.QuestionModel.findOnly({_id: Number(qid)});
    }
    data.cid = Number(cid);
    data.qid = Number(qid);
    data.categories = await db.ExamsCategoryModel.find({}).sort({order: 1});
    await next();
  });
