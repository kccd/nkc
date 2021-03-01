const Router = require("koa-router");

const router = new Router();
router
	.get('/', async (ctx, next) => {
        const {data, db} = ctx;
        const reviewSettings = await db.SettingModel.getSettings("review");
        data.keywordSetting = reviewSettings.keyword;
        ctx.template = 'experimental/settings/sensitiveWords/sensitiveWords.pug';
        await next();
	})

module.exports = router;