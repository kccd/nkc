const Router = require('koa-router');
const router = new Router();
router
  .patch('/:_id', async (ctx, next) => {
    const {params, db, body, data, tools, settings, fs} = ctx;
    const {user} = data;
    const {contentLength} = tools.checkString;
    const {_id} = params;
    const {fields, files} = body;
    const {file} = files;
    let {question} = fields;
    const q = JSON.parse(question);
    if(Number(_id) !== q._id) ctx.throw(400, '参数错误');
    question = await db.QuestionModel.findOnly({_id: q._id});
    if(!question.content) ctx.throw(400, '题目内容不能为空');
    if(contentLength(question.content) > 800) ctx.throw(400, '题目内容不能超过800字节');
    if(question.type === 'ch4') {
      if(question.answer.length !== 4) ctx.throw(400, '单项选择题需含有四个选项');
      for(const a of question.answer) {
        if(!a) ctx.throw(400, '答案内容不能为空');
        if(contentLength(a) > 500) ctx.throw(500, '答案内容不能超过500字节');
      }
    } else {
      if(!question.answer[0]) ctx.throw(400, '答案内容不能为空');
      question.answer = [question.answer[0]];
    }
    if(file) {
      const {path} = file;
      const questionPath = settings.upload.questionImagePath;
      const targetPath = questionPath + '/' + q._id + '.jpg';
      await tools.imageMagick.questionImageify(path, targetPath);
      await fs.unlink(path);
      q.hasImage = true;
    }
    q.uidLm = user.uid;
    q.tlm = Date.now();
    await question.update(q);
    const newQuestion = await db.QuestionModel.findOnly({_id: question._id});
    data.question = (await db.QuestionModel.extendQuestions([newQuestion]))[0];
    await next();
  })
  .get('/:_id/image', async (ctx, next) => {
    const {params, db, settings} = ctx;
    const {_id} = params;
    const question = await db.QuestionModel.findOnly({_id});
    ctx.filePath = settings.upload.questionImagePath + '/' + question._id + '.jpg';
    ctx.set('Cathe-Control', `public, max-age=${settings.cache.maxAge}`);
    ctx.type = 'jpg';
    await next();
  })
  .post('/:_id/image', async (ctx, next) => {
    const {db,  body, settings} = ctx;
    
    await next();
  })
  .post('/:_id/disabled', async (ctx, next) => {
    const {db, params} = ctx;
    const {_id} = params;
    const question = await db.QuestionModel.findOnly({_id});
    await question.update({disabled: true});
    await next();
  })
  .del('/:_id/disabled', async (ctx, next) => {
    const {db, params} = ctx;
    const {_id} = params;
    const question = await db.QuestionModel.findOnly({_id});
    await question.update({disabled: false});
    await next();
  });
module.exports = router;
