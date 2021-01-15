const Router = require('koa-router');
const router = new Router();
router
	.get('/', async (ctx, next) => {
    const { db, data } = ctx;
    const { forum } = data;
    const reviewSettings = await db.SettingModel.getSettings("review");
    const wordGroup = reviewSettings.keyword.wordGroup;
    data.wordGroupInfo = wordGroup.map(group => ({
      name: group.name,
      len: group.keywords.length
    }));
    data.useGroup = forum.keywordReviewUseGroup;
    data.fid = forum.fid;
		ctx.template = 'forum/settings/review.pug';
		await next();
	})
  .put('/', async (ctx, next) => {
    const {data, db, body} = ctx;
    const { forum } = data;
    const {
      newUseWordGroup      // 里面是敏感词组组名组成的数组
    } = body;
    console.log(newUseWordGroup);
    if(newUseWordGroup instanceof Array) {
      await db.ForumModel.update({ fid: forum.fid }, {
        keywordReviewUseGroup: newUseWordGroup
      })
    }
    await next();
  });
module.exports = router;
