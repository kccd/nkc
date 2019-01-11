const Router = require('koa-router');
const categoryRouter = new Router();
categoryRouter
  .get('/:_id', async (ctx, next) => {
    const {data, db, params, nkcModules, query} = ctx;
    const {_id} = params;
    const {page = 0} = query;
    const category = await db.ExamsCategoryModel.findOne({_id});
    if(!category) ctx.throw(404);
    // if(category.disabled) ctx.throw(403, '该考试科目已被屏蔽，请刷新');
    data.category = category;
    if(ctx.get('FROM') !== 'nkcAPI') {
      ctx.template = 'exam/category.pug';
      return await next();
    }
    const count = await db.QuestionModel.count({cid: category._id});
    const paging = nkcModules.apiFunction.paging(page, count);
    const questions = await db.QuestionModel.find({cid: category._id}).sort({toc: -1}).skip(paging.start).limit(paging.limit);
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
    // 暂时未添加审核流程，若普通用户有添加考试题的权限则默认false，并走审核流程
    question.auth = true;
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
  .post('/', async (ctx, next) => {
    const {data, db, body, tools} = ctx;
    const {user} = data;
    const {category} = body;
    if(!category.name) ctx.throw(400, '科目名称不能为空');
    if(tools.checkString.contentLength(category.name) > 100) ctx.throw(400, '科目名称不能大于100个字节');
    if(tools.checkString.contentLength(category.description) > 1000) ctx.throw(400, '科目介绍不能大于1000个字节');
    if(category.paperAQuestionsCount < 1) ctx.throw(400, '试卷A题目数量不能小于1');
    if(category.paperBQuestionsCount < 1) ctx.throw(400, '试卷B题目数量不能小于1');
    if(category.paperAPassScore < 1 || category.paperAPassScore > category.paperAQuestionsCount) ctx.throw(400, '试卷A及格分数不能小于1且不能超过试卷题目数量');
    if(category.paperBPassScore < 1 || category.paperBPassScore > category.paperBQuestionsCount) ctx.throw(400, '试卷B及格分数不能小于1且不能超过试卷题目数量');
    const saveName = await db.ExamsCategoryModel.findOne({name: category.name});
    if(saveName) ctx.throw(400, '科目名称已存在');
    category._id = await db.SettingModel.operateSystemID('examsCategories', 1);
    category.uid = user.uid;
    category.disabledA = true;
    category.disabledB = true;
    const c = db.ExamsCategoryModel(category);
    await c.save();
    data.category = c;
    await next();
  })
  .patch('/:_id', async (ctx, next) => {
    const {data, db, body, tools} = ctx;
    const {user} = data;
    const {category} = body;
    if(!category.name) ctx.throw(400, '科目名称不能为空');
    if(tools.checkString.contentLength(category.name) > 100) ctx.throw(400, '科目名称不能大于100个字节');
    if(tools.checkString.contentLength(category.description) > 1000) ctx.throw(400, '科目介绍不能大于1000个字节');
    if(category.paperAQuestionsCount < 1) ctx.throw(400, '试卷A题目数量不能小于1');
    if(category.paperBQuestionsCount < 1) ctx.throw(400, '试卷B题目数量不能小于1');
    if(category.paperAPassScore < 1 || category.paperAPassScore > category.paperAQuestionsCount) ctx.throw(400, '试卷A及格分数不能小于1且不能超过试卷题目数量');
    if(category.paperBPassScore < 1 || category.paperBPassScore > category.paperBQuestionsCount) ctx.throw(400, '试卷B及格分数不能小于1且不能超过试卷题目数量');
    const c = await db.ExamsCategoryModel.findOnly({_id: category._id});
    const sameName = await db.ExamsCategoryModel.findOne({_id: {$ne: category._id}, name: category.name});
    if(sameName) ctx.throw(400, '科目名称已存在');
    category.uidLm = user.uid;
    if(!category.disabledA) {
      const questionsCount = await db.QuestionModel.count({disabled: false, auth: true, cid: category._id, volume: 'A'});
      if(questionsCount < category.paperAQuestionsCount) ctx.throw(400, '试卷A题目数量不能大于该科目下的总题目数量，请更改试卷题目数量或添加题目');
    }
    if(!category.disabledB) {
      const questionsCount = await db.QuestionModel.count({disabled: false, auth: true, cid: category._id, volume: 'B'});
      if(questionsCount < category.paperBQuestionsCount) ctx.throw(400, '试卷B题目数量不能大于该科目下的总题目数量，请更改试卷题目数量或添加题目');
    }
    await c.update(category);
    data.category = category;
    await next();
  })
  .del('/:_id', async (ctx, next) => {
    const {db, params} = ctx;
    const {_id} = params;
    const category = await db.ExamsCategoryModel.findOnly({_id});
    const questions = await db.QuestionModel.count({cid: _id});
    if(questions > 0) ctx.throw(400, '请先将该科目下的试题移动至其他科目');
    await category.remove();
    await next();
  });
module.exports = categoryRouter;