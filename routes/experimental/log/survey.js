const { OnlyOperation } = require('../../../middlewares/permission');
const { Operations } = require('../../../settings/operations');
const { userInfoService } = require('../../../services/user/userInfo.service');

const router = require('koa-router')();
router.get(
  '/',
  OnlyOperation(Operations.visitExperimentalSurvey),
  async (ctx, next) => {
    let page = Number(ctx.query.page) || 0;
    if (isNaN(page) || page < 0) {
      page = 0;
    }
    const perPage = 50;
    const match = {
      originId: '',
    };
    const count = await ctx.db.SurveyModel.countDocuments(match);
    const paging = ctx.nkcModules.apiFunction.paging(page, count, perPage);
    const surveys = await ctx.db.SurveyModel.find(match)
      .sort({ toc: -1 })
      .skip(paging.start)
      .limit(perPage)
      .lean();
    const usersId = surveys.map((survey) => survey.uid);
    const users = await userInfoService.getUsersBaseInfoObjectByUserIds(
      usersId,
    );
    ctx.data.surveys = [];
    for (const survey of surveys) {
      ctx.data.surveys.push({
        _id: survey._id,
        toc: survey.toc,
        uid: survey.uid,
        user: users[survey.uid],
        type: survey.type,
        description: survey.description,
        disabled: survey.disabled,
        pid: survey.pid,
      });
    }
    ctx.data.paging = paging;
    ctx.template = 'experimental/log/survey/survey.pug';
    await next();
  },
);

router.get(
  '/:surveyId',
  OnlyOperation(Operations.visitExperimentalSurvey),
  async (ctx, next) => {
    const id = ctx.params.surveyId;
    const survey = await ctx.db.SurveyModel.findOnly({ _id: id });
    const surveyPosts = await ctx.db.SurveyPostModel.find({
      surveyId: survey._id,
    }).lean();
    const usersId = [
      ...new Set(surveyPosts.map((post) => post.uid).filter((uid) => uid)),
    ];
    const users = await userInfoService.getUsersBaseInfoObjectByUserIds(
      usersId,
    );
    for (const post of surveyPosts) {
      if (!post.uid) {
        continue;
      }
      const user = users[post.uid];
      post.user = user || { uid: post.uid, username: post.uid };
      post.username = post.user.username;
    }
    ctx.data.surveyPosts = surveyPosts;
    ctx.data.survey = survey;
    ctx.template = 'experimental/log/survey/surveyDetails.pug';
    await next();
  },
);
module.exports = router;
