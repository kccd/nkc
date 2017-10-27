const Router = require('koa-router');
const questionRouter = new Router();
// 通过uid和category查询
let findQuestion = async (db, uidObj, categoryObj) => {
  let questions = await db.QuestionModel.find().and([uidObj, categoryObj]).sort({toc:-1});
  if(!uidObj) {
    for(let question of questions) {
      question.user = await ctx.db.UserModel.findOne({uid: question.uid});
    }
  }
  return questions;
};
// 默认数据
let defaultData = async (db) => {
  let data = {};
  data.numberByCategory = await db.QuestionModel.aggregate([
    {$group: {_id: '$category', number: {$sum: 1}}},
    {$sort: {number: -1}},
    {$project: {_id: 0, category: '$_id', number: 1}}
  ]);
  data.numberByUser = await db.QuestionModel.aggregate([
    {$group: {_id: '$username', number: {$sum: 1}}},
    {$sort:{number: -1}},
    {$project: {_id: 0, username: '$_id', number: 1}},
  ]);
  return data;
};

questionRouter
  .get('/', async (ctx, next) => {
    let user = ctx.data.user;
    if(!user) {
      ctx.throw(401, '你还没有登陆，请登录后再试。');
    }
    ctx.data.questions = await findQuestion(ctx.db, {}, {});
    ctx.data.userQuestions = await findQuestion(ctx.db, {uid: user.uid}, {});
    let defaultDate = await defaultData(ctx.db);
    ctx.data.numberByCategory = defaultDate.numberByCategory;
    ctx.data.numberByUser = defaultDate.numberByUser;
    ctx.template = 'questions_edit.pug';
    await next();
  })
  .get('/:category', async (ctx, next) => {
    let user = ctx.data.user;
    let category = ctx.params.category;
    ctx.data.questions = await findQuestion(ctx.db, {}, {category: category});
    ctx.data.userQuestions = await findQuestion(ctx.db, {uid: user.uid}, {});
    let defaultDate = await defaultData(ctx.db);
    ctx.data.numberByCategory = defaultDate.numberByCategory;
    ctx.data.numberByUser = defaultDate.numberByUser;
    ctx.template = 'questions_edit.pug';
    await next();
  })
  .post('/:category', async (ctx, next) => {
    let params = ctx.body;
    let user = ctx.data.user;
    let qid = await ctx.db.SettingModel.operateSystemID('questions', 1);
    let question = new ctx.db.QuestionModel({
      uid: user.uid,
      username: user.username,
      question: params.question,
      answer: params.answer,
      type: params.type,
      category: params.category,
      tlm: Date.now(),
      qid: qid
    });
    try{
      await question.save();
    }catch(err) {
      await ctx.db.SettingModel.operateSystemID('questions', -1);
      ctx.throw(500, `添加考试题失败！ ${err}`);
    }
    await next();
  })
  .put('/:category/:qid', async (ctx, next) => {
    let params = ctx.body;
    let question = {
      question: params.question,
      answer: params.answer,
      type: params.type,
      category: params.category,
      tlm: Date.now()
    };
    return await ctx.db.QuestionModel.updateOne({qid: params.qid},{$set: question});
  })
  .get('/:category/:qid', async (ctx, next) => {
    let qid = ctx.params.qid;
    ctx.data.question = await ctx.db.QuestionModel.findOne({qid: qid});
    await next();
  })
  .del('/:category/:qid', async (ctx, next) => {
    let qid = ctx.params.qid;
    return await ctx.db.QuestionModel.deleteOne({qid: qid});
    await next();
  });


module.exports = questionRouter;
//狗蛋儿在外被人揍了，于是下定决心存钱买个手机，请问狗蛋儿最有可能买什么牌子手机？$小米$三星$诺基亚$山寨机就是牛