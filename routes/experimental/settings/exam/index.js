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
		const examsCategories = await db.ExamsCategoryModel.find().sort({order: 1});
		data.examsCategories = await Promise.all(examsCategories.map(async c => {
      const category = c.toObject();
      category.countA = await db.QuestionModel.count({cid: c._id, volume: 'A', auth: true, disabled: false});
      category.countB = await db.QuestionModel.count({cid: c._id, volume: 'B', auth: true, disabled: false});
      return category;
    }));
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