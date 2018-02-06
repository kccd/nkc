const Router = require('koa-router');
const settingsRouter = new Router();
settingsRouter
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		data.nav = '填写申请表';
		const {user, applicationForm} = data;
		if(applicationForm.disabled) ctx.throw(401, '抱歉！该申请表已被管理员封禁。');
		const {status} = applicationForm;
		if(user.uid !== applicationForm.uid && data.userLevel < 7) ctx.throw(401, '权限不足');
		if(status.adminSupport) ctx.throw(400, '管理员审核已通过，无法修改申请表。');
		let {s} = ctx.query;
		if(s) {
			s = parseInt(s);
		} else {
			s = 1;
		}
		if(applicationForm.status.submitted && s === 1) s = 2;
		data.s = s;
		const userPersonal = await db.UsersPersonalModel.findOnly({uid: applicationForm.uid});
		data.lifePhotos = await userPersonal.extendLifePhotos();
		ctx.template = 'interface_fund_apply.pug';
		await applicationForm.update({'lock.submitted': false});
		await next();
	});
module.exports = settingsRouter;