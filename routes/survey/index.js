const Router = require("koa-router");
const router = new Router();
const surveyRouter = require("./singleSurvey");
router
  .get("/", async (ctx, next) => {
    const {data, db} = ctx;
    const {user} = data;
    data.grades = await db.UsersGradeModel.find().sort({_id: 1});
    data.roles = await db.RoleModel.find({_id: {$nin: ["visitor", "banned"]}});
    /*const survey = db.SurveyModel({
      type: "vote",
      uid: user.uid,
      pid: "0",
      mid: user.uid,
      st: Date.now(),
      et: Date.now()
    });
    delete survey._id;
    delete survey.uid;
    delete survey.mid;
    delete survey.et;
    delete survey.st;
    data.survey = survey;
    console.log(data.survey)*/
    await next();
  })
  .post("/", async (ctx, next) => {
    const {db, body, data} = ctx;
    const {user} = data;
    const {survey} = body;
    console.log(survey);
    const {
      options, reward, permission, type
    } = survey;
    if(!survey.description) ctx.throw(400, "说名不能为空");
    if(!options || !options.length) ctx.throw(400, "请至少添加一个选择");
    for(const option of options) {
      if(!option.content) ctx.throw(400, "选项内容不能为空");
      if(type === "survey" && !option.answers.length) ctx.throw(400, "请为每个选项至少添加一个答案");
      option.minScore = parseInt(option.minScore);
      option.maxScore = parseInt(option.maxScore);
      if(type === "score") {
        if(option.minScore < 1) ctx.throw(400, "最小分值不能小于1");
        if(option.maxScore <= option.minScore) ctx.throw(400, "最大分值必须大于最小分值");
      }
      for(const answer of option.answers) {
        if(!answer.content) ctx.throw(400, "选项答案内容不能为空");
        answer._id = await db.SettingModel.operateSystemID("surveyOptionAnswers", 1);
      }
      option._id = await db.SettingModel.operateSystemID("surveyOptions", 1);
    }
    survey.voteCount = parseInt(survey.voteCount);
    if(type === "vote") {
      if(!survey.voteCount) ctx.throw(400, "请设置最大可选择选项的数目");
      if(!survey.voteCount > options.length) ctx.throw(400, "最大可选择数目不能超过选项数目");
    }
    const now = Date.now();
    if((new Date(survey.st)).getTime() >= (new Date(survey.et)).getTime()) ctx.throw(400, "结束时间必须大于开始时间");
    if((new Date(survey.et)).getTime() <= now) ctx.throw(400, "结束时间必须大于当前时间");
    const {
      registerTime, digestThreadCount, threadCount, postCount, voteUpCount,
      minGradeId, certsId
    } = permission;
    permission.registerTime = parseInt(registerTime);
    permission.digestThreadCount = parseInt(digestThreadCount);
    permission.threadCount = parseInt(threadCount);
    permission.postCount = parseInt(postCount);
    permission.voteUpCount = parseInt(voteUpCount);
    if(!certsId.length) ctx.throw(400, "请至少勾选一个证书");
    survey.uid = user.uid;
    survey.mid = user.uid;
    survey._id = await db.SettingModel.operateSystemID("surveys", 1);
    const s = db.SurveyModel(survey);
    await s.save();
    console.log(s);
    await next();
  })
  .use("/:surveyId", surveyRouter.routes(), surveyRouter.allowedMethods());
module.exports = router;