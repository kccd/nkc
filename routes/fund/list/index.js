const Router = require('koa-router');
const listRouter = new Router();
const singleFundRouter = require('./singleFund');
listRouter
	// 基金项目列表
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		data.funds = await db.FundModel.find({display: true, disabled: false, history: false}).sort({toc: 1});
		ctx.template = 'fund/list/fundList.pug';
		await next();
	})
	// 添加基金项目
	.post('/', async (ctx, next) => {
		const {data, db} = ctx;
		let {fundName, fundId} = ctx.body;
		fundId = fundId.toLocaleString();
		const sameFund = await db.FundModel.findOne({
      $or: [
        {
          name: fundName
        },
        {
          _id: fundId
        }
      ]
    });
		if(sameFund) {
		  if(sameFund.name === fundName) {
		    ctx.throw(400, `基金名已存在`);
      } else {
		    ctx.throw(400, `基金代号已存在`);
      }
    }
		const fund = db.FundModel({
      _id: fundId,
      name: fundName
    });
		await fund.save();
		data.fundId = fund._id;
		await next();
	})
  .use('/:fundId', singleFundRouter.routes(), singleFundRouter.allowedMethods());
module.exports = listRouter;
