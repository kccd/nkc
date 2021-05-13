const Router = require('koa-router');
const router = new Router();
router
	.get('/', async (ctx, next) => {
    const { db, data } = ctx;
    const { forum } = data;
    data.roles = await db.RoleModel.find().sort({toc: 1});
    data.grades = await db.UsersGradeModel.find().sort({score: 1});
    // data.roleGradeReview = forum.roleGradeReview;
    const reviewSettings = await db.SettingModel.getSettings("review");
    const wordGroup = reviewSettings.keyword.wordGroup;
    data.wordGroupInfo = wordGroup.map(group => ({
      id: group.id,
      name: group.name,
      len: group.keywords.length
    }));
    data.forumReviewSettings = forum.reviewSettings;
    // data.keywordReviewPlanUseTo = forum.keywordReviewPlanUseTo;
    // data.useGroup = forum.keywordReviewUseGroup;
    // data.reviewPlan = forum.reviewPlan;
    data.fid = forum.fid;
		ctx.template = 'forum/settings/review.pug';
		await next();
	})
  .put('/', async (ctx, next) => {
    const {data, db, body} = ctx;
    const { forum } = data;
    const {
      settings
    } = body;
    await db.ForumModel.updateOne({ fid: forum.fid }, {
      $set: {
        reviewSettings: settings
      }
    });
    await next();
  });
module.exports = router;
