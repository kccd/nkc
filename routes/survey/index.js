const Router = require("koa-router");
const router = new Router();
const surveyRouter = require("./singleSurvey");
router
  .get("/", async (ctx, next) => {
    const {data, db, query} = ctx;
    const {t} = query;
    const {user} = data;
    data.grades = await db.UsersGradeModel.find().sort({_id: 1});
    data.roles = await db.RoleModel.find({_id: {$nin: ["visitor", "banned"]}});
    const postSettings = await db.SettingModel.getSettings("post");
    let surveySettings;
    if(t === "thread") {
      surveySettings = postSettings.postToForum.survey;
    } else {
      surveySettings = postSettings.postToThread.survey;
    }
    const deadlineMax = await db.SurveyModel.getDeadlineMax(t, data.user.uid);
    if(deadlineMax) {
      data.deadlineMax = deadlineMax;
    }
    data.surveyRewardScore = await db.SettingModel.getScoreByOperationType('surveyRewardScore');
    data.targetUserSurveyRewardScore = await db.UserModel.getUserScore(user.uid, data.surveyRewardScore.type);
    await next();
  })
  .post("/", async (ctx, next) => {
    const {db, body, data} = ctx;
    const {user} = data;
    const {survey} = body;
    survey.uid = user.uid;
    survey.mid = user.mid;
    await db.SurveyModel.createSurvey(survey);
    await next();
  })
  .use("/:surveyId", surveyRouter.routes(), surveyRouter.allowedMethods());
module.exports = router;
