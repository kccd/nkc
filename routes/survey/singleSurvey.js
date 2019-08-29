const Router = require("koa-router");
const router = new Router();
router
  .use("/", async (ctx, next) => {
    const {db, params, data} = ctx;
    const {surveyId} = params;
    const survey = await db.SurveyModel.findOne({_id: surveyId});
    if(!survey) ctx.throw(400, `未找到ID为${surveyId}的表单`);
    if(survey.disabled) ctx.throw(403, "表单已屏蔽");
    data.survey = survey;
    await next();
  })
  .get("/", async (ctx, next) => {
    const {db, data} = ctx;
    const {survey} = data;
    data.havePermission = false;
    if(data.user) {
      data.surveyPost = await db.SurveyPostModel.findOne({uid: data.user.uid, surveyId: survey._id});
      console.log(data.surveyPost);
      try{
        await survey.checkUserPermission(data.user.uid);
        data.havePermission = true;
      } catch(err) {}
    }
    await next();
  })
  .post("/", async (ctx, next) => {
    const {db, data, body} = ctx;
    const {survey, user} = data;
    const {options} = body;
    await survey.ensurePostPermission(user.uid);
    const optionsId = survey.options.map(o => o._id);
    if(survey.type === "vote") { // 投票
      if(!options.length) ctx.throw(400, "请至少勾选一项");
      for(const id of options) {
        if(!optionsId.includes(id)) ctx.throw(400, "未知的选项ID");
      }
      if(options.length > survey.voteCount) ctx.throw(400, `最多只能勾选${survey.voteCount}个选项`);
    } else if(survey.type === "score") { // 打分
      if(!options.length || survey.options.length !== options.length) ctx.throw(400, "数据存在问题，提交的选项数不正确");
      for(let i = 0; i < survey.options.length; i++) {
        const option = survey.options[i];
        if(options[i].score < option.minScore || options[i] > option.maxScore) ctx.throw(400, "分值不在规定的范围内，请检查");
        options[i] = {
          score: options[i].score
        }
      }
    } else { // 问卷调查
      if(!options.length || survey.options.length !== options.length) ctx.throw(400, "数据存在问题，提交的选项数不正确");
      for(let i = 0; i < survey.options.length; i++) {
        const option = survey.options[i];
        const answersId = option.answers.map(a => a._id);
        if(!answersId.includes(options[i].answer)) ctx.throw(400, "还有未选择的题目，请检查");
        options[i] = {
          answer: options[i].answer
        };
      }
    }
    const surveyPost = db.SurveyPostModel({
      _id: await db.SettingModel.operateSystemID("surveyPosts", 1),
      surveyId: survey._id,
      surveyType: survey.type,
      uid: user.uid,
      options
    });
    await surveyPost.save();
    data.surveyPost = surveyPost;
    await next();
  });
module.exports = router;