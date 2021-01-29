const Router = require('koa-router');
const router = new Router();
router
	.get('/', async (ctx, next) => {
    const { db, data } = ctx;
    const { forum } = data;
    data.roles = await db.RoleModel.find().sort({toc: 1});
    data.grades = await db.UsersGradeModel.find().sort({score: 1});
    data.roleGradeReview = forum.roleGradeReview;
    const reviewSettings = await db.SettingModel.getSettings("review");
    const wordGroup = reviewSettings.keyword.wordGroup;
    data.wordGroupInfo = wordGroup.map(group => ({
      name: group.name,
      len: group.keywords.length
    }));
    data.useGroup = forum.keywordReviewUseGroup;
    data.allContentShouldReview = forum.allContentShouldReview;
    data.fid = forum.fid;
		ctx.template = 'forum/settings/review.pug';
		await next();
	})
  .put('/', async (ctx, next) => {
    const {data, db, body} = ctx;
    const { forum } = data;
    const {
      newUseWordGroup,      // 里面是敏感词组组名组成的数组
      allContentShouldReview,   // 是否本专业所有内容都需要送审
      roleGradeReview,          // 按角色和等级之间关系送审
    } = body;
    if(newUseWordGroup instanceof Array) {
      await db.ForumModel.update({ fid: forum.fid }, {
        keywordReviewUseGroup: newUseWordGroup,
        allContentShouldReview,
        roleGradeReview
      })
    }
    await next();
  });
module.exports = router;
