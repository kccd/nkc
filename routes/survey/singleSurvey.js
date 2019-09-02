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
      } catch(err) {
        console.log(err);
      }
    }
    await next();
  })
  .post("/", async (ctx, next) => {
    const {db, data, body} = ctx;
    const {survey, user} = data;
    let {options} = body;
    await survey.ensurePostPermission(user.uid);
    if(survey.type === "vote") {
      options = [options[0]];
      survey.options = [survey.options[0]];
    }
    if(!options.length || options.length !== survey.options.length) ctx.throw(400, "数据异常，请刷新后重试");
    for(let i = 0; i < survey.options.length; i++) {
      const sOption = survey.options[i];
      const option = options[i];
      if(sOption._id !== option._id) ctx.throw(400, "数据异常，可能是调查的发布者修改了数据。请刷新后重试。");
      let voteCount = 0;
      for(let j = 0; j < sOption.answers.length; j++) {
        const sAnswer = sOption.answers[j];
        const answer = option.answers[j];
        if(sAnswer._id !== answer._id) ctx.throw(400, "数据异常，可能是调查的发布者修改了数据。请刷新后重试。");
        if(answer.selected) voteCount++;
        if(survey.type === "score") {
          const minScore = sAnswer.minScore;
          const maxScore = sAnswer.maxScore;
          let score = answer.score;
          score = Number(score.toFixed(2));
          if(score < minScore || score > maxScore) {
            ctx.throw(400, "打分分值不在要求的范围内");
          }
        }
        option.answers[j] = {
          _id: answer._id,
          score: answer.score,
          selected: answer.selected
        }
      }
      options[i] = {
        _id: option._id,
        answers: option.answers
      };
      if(survey.type !== "score") {
        if(!voteCount) ctx.throw(400, "针对每个调查，请至少勾选一个选项");
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