const Router = require('koa-router');
const categoryRouter = new Router();
categoryRouter
  .get('/:_id', async (ctx, next) => {
    const {data, db, params, nkcModules, query} = ctx;
    const {_id} = params;
    const {page = 0, options} = query;
    const category = await db.ExamsCategoryModel.findOne({_id});
    if(!category) ctx.throw(404);
    if(category.disabled) ctx.throw(403, '该考试科目已被屏蔽，请刷新');
    data.category = category;
    if(ctx.get('FROM') !== 'nkcAPI') {
      ctx.template = 'exam/category.pug';
      return await next();
    }
    ctx.template = 'exam/category.pug';
    const q = {
      cid: category._id
    };
    if(options) {
      const o = JSON.parse(options);
      q.disabled = {$in: o.disabled};
      q.auth = {$in: o.auth};
      q.volume = {$in: o.volume};
    }
    const count = await db.QuestionModel.count(q);
    const paging = nkcModules.apiFunction.paging(page, count);
    const questions = await db.QuestionModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    // const questions = await db.QuestionModel.find({cid: category._id}).sort({toc: -1});
    data.paging = paging;
    data.questions = await db.QuestionModel.extendQuestions(questions);
    data.categories = await db.ExamsCategoryModel.find().sort({order: 1});
    await next();
  })
  .post('/:_id', async (ctx, next) => {
    const {params, data, db, body, settings, tools, fs} = ctx;
    const {_id} = params;
    const {user} = data;
    const category = await db.ExamsCategoryModel.findOnly({_id});
    const {contentLength} = tools.checkString;
    const {fields, files} = body;
    const {file} = files;
    let {question} = fields;
    question = JSON.parse(question);
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
    question._id = await db.SettingModel.operateSystemID('questions', 1);
    question.cid = category._id;
    question.uid = user.uid;
    const q = db.QuestionModel(question);
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
    const {data, db, body, tools, params} = ctx;
    const {_id} = params;
    const categoryDB = await db.ExamsCategoryModel.findOnly({_id});
    const {volume} = categoryDB;
    const {user} = data;
    const {contentLength} = tools.checkString;
    const {category} = body;
    let {
      name,
      description,
      from,
      rolesId,
      passScore,
      time,
      disabled
    } = category;
    if(!name) ctx.throw(400, '考卷名不能为空')
    if(contentLength(name) > 50) ctx.throw(400, '考卷名称字数不能大于50');
    if(!description) ctx.throw(400, '考卷介绍不能为空');
    if(contentLength(description) > 500) ctx.throw(400, '考卷介绍字数不能大于500');
    if(!rolesId) rolesId = [];
    if(rolesId.length !== 0) {
      const roles = await db.RoleModel.find({_id: {$in: rolesId}, defaultRole: false});
      rolesId = roles.map(r => r._id);
    }
    if(!from) from === [];
    let questionsCount = 0;
    if(from.length !== 0) {
      for(const f of from) {
        const {fid, count, type} = f;
        delete f.countA;
        delete f.countB;
        questionsCount += count;
        if(type === 'pub') {
          const pubCount = await db.QuestionModel.count({
            disabled: false,
            auth: true,
            public: true,
            volume
          });
          if(count > pubCount) ctx.throw(400, '公共题库试题数目不足，请刷新');
        } else {
          const questionCount = await db.QuestionModel.count({
            disabled: false,
            auth: true,
            volume,
            public: false,
            fid
          });
          if(count > questionCount) {
            const forum = await db.ForumModel.findOnly({fid});
            ctx.throw(400, `${forum.displayName}题库数量不足，请刷新`);
          }
        }
      }
    }
    if(category.passScore < 1 || category.passScore > questionsCount) ctx.throw('及格分数不能大于试题总数且不能小于1');
    if(category.time <= 0) ctx.throw(400, '答题时间必须大于0分钟');
    category.disabled = !!category.disabled;
    const q = {
      from,
      uid: user.uid,
      name,
      description,
      rolesId,
      passScore,
      time,
      disabled
    };
    await categoryDB.update(q);
    await next();
  });
module.exports = categoryRouter;