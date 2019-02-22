const Router = require('koa-router');
const router = new Router();
router
  .post('/', async (ctx, next) => {
    const {db, data, body, tools, settings, fs} = ctx;
    const {user} = data;
    const {contentLength} = tools.checkString;
    const {fields, files} = body;
    const {file} = files;
    let {question} = fields;
    question = JSON.parse(question);
    let {
      type,
      public,
      volume,
      content,
      answer,
      fid
    } = question;
    if(!type) ctx.throw(400, '答题方式不能为空');
    if(!volume) ctx.throw(400, '试题难度不能为空');
    if(!public) {
      const forum = await db.ForumModel.findOne({fid});
      if(!forum) ctx.throw(404, '专业领域不存在');
    }
    if(content === '') ctx.throw(400, '试题内容不能为空');
    if(contentLength(content) > 500) ctx.throw(400, '试题内容字数不能超过500');
    // 检测试题答案数量是否正确、内容是否为空
    if(type === 'ch4') {
      if(answer.length !== 4) ctx.throw(400, '答案数量不足');
      for(const a of answer) {
        if(a === '') ctx.throw(400, '答案不能为空');
        if(contentLength(a) > 200) ctx.throw(400, '答案字数不能超过200');
      }
    } else {
      if(answer[0] === '') ctx.throw(400, '答案不能为空');
      if(contentLength(answer[0]) > 200) ctx.throw(400, '答案字数不能超过200');
      answer = [answer[0]];
    }
    const _id = await db.SettingModel.operateSystemID('questions', 1);
    const q = db.QuestionModel({
      _id,
      fid,
      type,
      public,
      volume,
      content,
      answer,
      uid: user.uid,
      hasImage: false
    });
    if(file) {
      const {path} = file;
      const questionPath = settings.upload.questionImagePath;
      const targetPath = questionPath + '/' + q._id + '.jpg';
      await tools.imageMagick.questionImageify(path, targetPath);
      await fs.unlink(path);
      q.hasImage = true;
    }
    await q.save();
    data.question = (await db.QuestionModel.extendQuestions([q]))[0];
    await next();
  })
  .patch('/:_id', async (ctx, next) => {
    const {db, data, body, params, tools, settings, fs} = ctx;
    const {contentLength} = tools.checkString;
    const {user} = data;
    const {_id} = params;
    const questionDB = await db.QuestionModel.findOnly({_id});
    if(questionDB.disabled) ctx.throw(403, '试题已被屏蔽');
    if(questionDB.auth !== null && !ctx.permission('modifyAllQuestions')) ctx.throw(403, '试题已被审核过了，无法修改');
    const {type, public, auth} = questionDB;
    const {fields, files} = body;
    const {file} = files;
    let {question} = fields;
    question = JSON.parse(question);
    let {
      content,
      answer,
      fid
    } = question;
    if(!public){
      if(!fid) ctx.throw(400, '专业领域不能为空');
      const forum = await db.ForumModel.findOne({fid});
      if(!forum) ctx.throw(404, '专业领域不存在，请重新选择');
    } 
    if(content === '') ctx.throw(400, '试题内容不能为空');
    if(contentLength(content) > 500) ctx.throw(400, '试题内容字数不能超过500');
    // 检测试题答案数量是否正确、内容是否为空
    if(type === 'ch4') {
      if(answer.length !== 4) ctx.throw(400, '答案数量不足');
      for(const a of answer) {
        if(a === '') ctx.throw(400, '答案不能为空');
        if(contentLength(a) > 200) ctx.throw(400, '答案字数不能超过200');
      }
    } else {
      if(answer[0] === '') ctx.throw(400, '答案不能为空');
      if(contentLength(answer[0]) > 200) ctx.throw(400, '答案字数不能超过200');
      answer = [answer[0]];
    }
    const q = {
      fid,
      content,
      answer,
      hasImage: false
    };
    if(auth === false) {
      // 提交自己审核不通过的试题时，试题会再次变为"待审核"状态。
      if(questionDB.uid === user.uid) {
        q.auth = null;
      }
    } else if(auth === null) {
      // 当试题未通过审核时，若编辑者拥有审核试题的权限，则用户在编辑的时候可直接提交审核结果。
      if(ctx.permission('submitExamsQuestionAuth') && fields.auth) {
        let {status, reason} = JSON.parse(fields.auth);
        status = !!status;
        if(!status && reason === '') ctx.throw(400, '原因不能为空');
        if(contentLength(reason) > 500) ctx.throw(400, '原因字数不能超过500');
        q.auth = status;
        if(q.auth === false) q.reason = reason;
      }
    }
    
    if(file) {
      const {path} = file;
      const questionPath = settings.upload.questionImagePath;
      const targetPath = questionPath + '/' + _id + '.jpg';
      await tools.imageMagick.questionImageify(path, targetPath);
      await fs.unlink(path);
      q.hasImage = true;
    }
    await questionDB.update(q);
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
  .del('/:_id', async (ctx, next) => {
    const {params, db, data} = ctx;
    const {user} = data;
    const {_id} = params;
    const question = await db.QuestionModel.findOnly({_id});
    if(question.uid !== user.uid && !ctx.permission('removeAllQuestion')) ctx.throw(403, '仅能删除自己的且未能通过审核的试题');
    if(question.auth !== false) ctx.throw(400, '只能删除未通过审核的试题');
    await question.remove();
    await next();
  })
  .post('/:_id/disabled', async (ctx, next) => {
    const {db, params, body, tools} = ctx;
    const {contentLength} = tools.checkString;
    const {_id} = params;
    const {reason} = body;
    if(!reason) ctx.throw(400, '原因不能为空');
    if(contentLength(reason) > 500) ctx.throw(400, '原因字数不能超过500');
    const question = await db.QuestionModel.findOnly({_id});
    await question.update({disabled: true, reason});
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
