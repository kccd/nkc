const Router = require('koa-router');
const router = new Router();
router
  .get('/', async (ctx, next) => {
    ctx.template = '/exam/auth.pug';
    const {data, db} = ctx;
    const questions = await db.QuestionModel.find({
      disabled: false,
      auth: null
    }).sort({toc: -1});
    data.questions = await db.QuestionModel.extendQuestions(questions);
    await next();
  })
  .post('/', async (ctx, next) => {
    const {body, db, data, tools} = ctx;
    const {contentLength} = tools.checkString;
    let {status, reason, qid} = body;
    const question = await db.QuestionModel.findOnly({_id: qid});
    const {auth, disabled} = question;
    if(disabled) ctx.throw(403, '试题已被屏蔽，请刷新');
    if(auth !== null) ctx.throw(403, '试题不需要审核，请刷新');
    status = !!status;
    if(!status && reason === '') ctx.throw(400, '原因不能为空');
    if(contentLength(reason) > 500) ctx.throw(400, '原因字数不能超过500');
    await question.update({
      auth: status, 
      reason, 
      viewed: false,
      operatorId: data.user.uid,
      operationTime: Date.now()
    });
    await next();
  });
module.exports = router;