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
    console.log(data.survey)
    await next();
  });
module.exports = router;