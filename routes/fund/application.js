const Router = require('koa-router');
const applicationRouter = new Router();
applicationRouter
	.use('/:_id', async (ctx, next) => {
		const {data, db} = ctx;
		const {_id} = ctx.params;
		const applicationForm = await db.FundApplicationFormModel.findOnly({_id});
		const fund = await applicationForm.extendFund();
		data.applicationForm = applicationForm;
		data.fund = fund;
		await next();
	})
  .get('/:_id/settings', async (ctx, next) => {
  	const {data, db} = ctx;
  	const {user, applicationForm, fund} = data;
		if(user.uid !== applicationForm.uid && data.userLevel < 7) ctx.throw(401, '权限不足');
		ctx.template = 'interface_fund_apply.pug';
  	await next();
  });
module.exports = applicationRouter;
