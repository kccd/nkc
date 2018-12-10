const Router = require('koa-router');
const router = new Router();
router
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		data.kcbsTypes = await db.KcbsTypeModel.find();
		data.kcbSettings = await db.SettingModel.findOnly({type: 'kcb'});
		ctx.template = 'experimental/settings/kcb.pug';
		await next();
	})
	.patch('/', async (ctx, next) => {
		const {db, body} = ctx;
    const {kcbsTypes, minCount, maxCount} = body;
		if(minCount <= 0) ctx.throw(400, '最小值不能小于0');
		if(minCount > maxCount) ctx.throw(400, '最小值最大值设置错误');
    for(const type of kcbsTypes) {
      let {count, num, _id} = type;
      count = parseInt(count);
      num = parseInt(num);
      const type_ = await db.KcbsTypeModel.findOnly({_id});
      if(count >= 0 || count === -1) {

      } else {
        ctx.throw(400, `${typeOfScoreChange.description}的次数设置错误`);
      }
      if(count === 0 || num < 0 || num > 0) {

      } else {
        ctx.throw(400, `${typeOfScoreChange.description}的科创币变化值设置错误`)
      }
      await type_.update({count, num});
    }
    await db.SettingModel.update({type: 'kcb'}, {$set: {minCount, maxCount}});
		await next();
	});
module.exports = router;