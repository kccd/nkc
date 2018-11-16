const Router = require('koa-router');
const router = new Router();
router
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		data.kcbsTypes = await db.KcbsTypeModel.find();
		ctx.template = 'experimental/settings/kcb.pug';
		await next();
	})
	.patch('/', async (ctx, next) => {
		const {db, body} = ctx;
		const {kcbsTypes} = body;
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
		await next();
	});
module.exports = router;