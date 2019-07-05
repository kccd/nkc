const router = new require('koa-router')();
module.exports = router;
router
  .get('/', async (ctx, next) => {
    const {query, data, db} = ctx;
    const {qid} = query;
    ctx.template = 'exam/editor.pug';
    if(qid) {
      if(!ctx.permission('modifyQuestion')) ctx.throw(403, '权限不足');
      const question = await db.QuestionModel.findOnly({_id: Number(qid)});
      if(question.type === "ch4" && question.answer.length !== 4) {
        for(let i = 0; i < 4; i++) {
          if(!question.answer[i]) question.answer[i] = "";
        }
      }
      if(question.uid !== data.user.uid && !ctx.permission('modifyAllQuestions')) ctx.throw(403, '无权修改别人的试题');
      if(question.disabled) ctx.throw(403, '试题已被屏蔽，无法修改');
      if(question.auth === true && !ctx.permission('modifyAllQuestions')) ctx.throw(403, '试题已通过审核，无法修改');
      data.question = (await db.QuestionModel.extendQuestions([question]))[0];
    }
    data.qid = Number(qid);
    await next();
  });
