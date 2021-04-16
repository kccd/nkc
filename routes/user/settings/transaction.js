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
	.put('/', async (ctx, next) => {
		const {db, params, data, body, nkcModules} = ctx;
    const {uid} = params;
    const {checkString} = nkcModules.checkData;
    const userPersonal = await db.UsersPersonalModel.findOnly({uid});
    const userAddresses = userPersonal.addresses;
    let {addresses, operation} = body;
    const reg = /^[0-9]*$/;
    if(operation === "add") {

    } else {
      userAddresses.length = 0;
    }
    for(const a of addresses) {
      const {username, address, location, mobile} = a;
      checkString(username, {
        name: "收件人姓名",
        minLength: 1,
        maxLength: 50
      });
      checkString(location, {
        name: "所在地区",
        minLength: 1,
        maxLength: 100
      });
      checkString(address, {
        name: "详细地址",
        minLength: 1,
        maxLength: 500
      });
      checkString(mobile, {
        name: "手机号",
        minLength: 1,
        maxLength: 100
      });
      if(!reg.test(a.mobile)) {
        ctx.throw(400, '电话号码格式不正确');
      }
      userAddresses.push({
        username,
        location,
        address,
        mobile
      });
    }
    await userPersonal.updateOne({addresses: userAddresses});
    data.addresses = userAddresses;
		await next();
	});
module.exports = transactionRouter;
