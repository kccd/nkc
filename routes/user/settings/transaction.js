const Router = require('koa-router');
const transactionRouter = new Router();
transactionRouter
	.get('/', async (ctx, next) => {
		const {data, db, params} = ctx;
		data.selected = "transaction";
		const {uid} = params;
		const userPersonal = await db.UsersPersonalModel.findOnly({uid});
    data.alipayAccounts = userPersonal.alipayAccounts;
    data.bankAccounts = userPersonal.bankAccounts;
		data.targetUser = await db.UserModel.findOnly({uid});
		data.addresses = userPersonal.addresses;
		ctx.template = 'interface_user_settings_transaction.pug';
		await next();
	})
	.patch('/', async (ctx, next) => {
		const {db, params, body} = ctx;
		const {uid} = params;
		const userPersonal = await db.UsersPersonalModel.findOnly({uid});
		let {addresses} = body;
    const reg = /^[0-9]*$/;
    for(let a of addresses) {
      if(a.mobile) {
        if(!reg.test(a.mobile)) {
          ctx.throw(400, '电话号码格式不正确');
        }
      }
    }
    await userPersonal.update({addresses});
		await next();
	});
module.exports = transactionRouter;