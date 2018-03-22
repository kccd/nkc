const Router = require('koa-router');
const settingsRouter = new Router();
const dbFn = require('../../../nkcModules/dbFunction');
settingsRouter
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		data.nav = '填写申请表';
		const {user, applicationForm} = data;
		const {fund} = applicationForm;
		if(applicationForm.disabled) ctx.throw(401, '抱歉！该申请表已被屏蔽。');
		if(applicationForm.useless !== null) ctx.throw(401, '申请表已失效，无法完成该操作。');
		if(applicationForm.modifyCount >= fund.modifyCount) {
			await applicationForm.update({useless: 'exceededModifyCount'});
			throw '抱歉！申请表的修改次数已超过限制，无法提交修改。';
		}
		const {lock} = applicationForm;
		if(user.uid !== applicationForm.uid && data.userLevel < 7) ctx.throw(401, '权限不足');
		if(lock.submitted) ctx.throw(400, '申请表已提交，无法修改。');
		let {s} = ctx.query;
		if(s) {
			s = parseInt(s);
		} else {
			s = 1;
		}
		if(applicationForm.status.submitted && s === 1) s = 2;
		if(s === 4) {
			data.forumList = await dbFn.getAvailableForums(ctx);
		}
		if(s > 5) ctx.throw(404, 'not found');
		data.s = s;
		const userPersonal = await db.UsersPersonalModel.findOnly({uid: applicationForm.uid});
		data.lifePhotos = await userPersonal.extendLifePhotos();
		ctx.template = 'interface_fund_apply.pug';
		await applicationForm.update({'lock.submitted': false});
		await next();
	});
module.exports = settingsRouter;