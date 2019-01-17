const Router = require('koa-router');
const router = new Router();
router
	.get('/', async (ctx, next) => {
	  const from = ctx.get('FROM');
	  if(from !== 'nkcAPI') {
      ctx.template = 'experimental/settings/exam.pug';
      return await next();
    }
		const {data, db, query} = ctx;
	  const {cid} = query;
	  if(cid) data.cid = cid;
		data.examsCategories = await db.ExamsCategoryModel.find().sort({order: 1});
		data.roles = await db.RoleModel.find({defaultRole: false});
		await next();
	})
	.patch('/', async (ctx, next) => {
		const {db, body} = ctx;
		let {volumeAFailedPostCountOneDay} = body;
		volumeAFailedPostCountOneDay = parseInt(volumeAFailedPostCountOneDay);
		if(volumeAFailedPostCountOneDay < 0 && volumeAFailedPostCountOneDay !== -1) {
			ctx.throw(400, '回复数设置错误');
		}
		await db.SettingModel.update({_id: 'exam'}, {$set: {'c.volumeAFailedPostCountOneDay': volumeAFailedPostCountOneDay}});
		await next();
	});
module.exports = router;