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
    survey.uid = user.uid;
    survey.mid = user.mid;
    console.log(survey);
    await db.SurveyModel.createSurvey(survey);
    console.log(s);
    await next();
  })
  .use("/:surveyId", surveyRouter.routes(), surveyRouter.allowedMethods());
module.exports = router;