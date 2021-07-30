const Router = require('koa-router');
const settingsRouter = new Router();
const memberRouter = require('./member');
settingsRouter
  .use('/', async (ctx, next) => {
    const {data, state} = ctx;
    const {applicationForm} = data;
    if(applicationForm.uid !== state.uid) ctx.throw(403, `权限不足`);
    await next();
  })
	.get('/', async (ctx, next) => {
		const {data, db, nkcModules} = ctx;
		data.nav = '填写申请表';
		const {user, applicationForm} = data;
		const {fund} = applicationForm;
		if(applicationForm.disabled) ctx.throw(403,'抱歉！该申请表已被屏蔽。');
		if(applicationForm.useless !== null) ctx.throw(403,'申请表已失效，无法完成该操作。');
		if(applicationForm.modifyCount >= fund.modifyCount) {
			await applicationForm.updateOne({useless: 'exceededModifyCount'});
			throw '抱歉！申请表的修改次数已超过限制，无法提交修改。';
		}
		const {lock} = applicationForm;
		if(user.uid !== applicationForm.uid) ctx.throw(403,'权限不足');
		if(lock.submitted) ctx.throw(400, '申请表已提交，无法修改。');
		let {s} = ctx.query;
		if(s) {
			s = parseInt(s);
		} else {
			s = 1;
		}
		if(applicationForm.status.submitted && s === 1) s = 2;
		if(s === 3) {
			await applicationForm.extendProject();
		}
		if(s === 4) {
      data.forumList = await db.ForumModel.getAccessibleForums(data.userRoles, data.userGrade, data.user);
      data.forumsThreadTypes = await db.ThreadTypeModel.find({}).sort({order: 1});
		}
		
		if(s === 5) {
			const project = await data.applicationForm.extendProject();
			project.c = nkcModules.nkcRender.renderHTML({
				type: "article",
				post: {
					c: project.c,
					resources: await db.ResourceModel.getResourcesByReference(`fund-${project._id}`)
				},
				user: data.user
			});
		}
		if(s > 5) ctx.throw(404, 'not found');
		data.s = s;
		const userPersonal = await db.UsersPersonalModel.findOnly({uid: applicationForm.uid});
		data.lifePhotos = await userPersonal.extendLifePhotos();
		ctx.template = 'fund/apply/editForm.pug';
		await applicationForm.updateOne({'lock.submitted': false});
		if(applicationForm.toObject) {
      data.applicationForm = applicationForm.toObject();
    }

    if(ctx.query.new) {
      ctx.template = 'fund/apply/apply.pug';
      const {db, nkcModules, data, params, state} = ctx;
      const applicationForm = await db.FundApplicationFormModel.findOnly({_id: params._id});
      const fund = await db.FundModel.findOnly({_id: applicationForm.fundId});
      const applicant = await applicationForm.extendApplicant();
      const members = await db.FundApplicationUserModel.find({
        applicationFormId: applicationForm._id,
        uid: {$ne: state.uid},
        removed: false
      }).sort({toc: 1});
      const usersId = members.map(m => m.uid);
      const users = await db.UserModel.find({uid: {$in: usersId}}, {uid: 1, avatar: 1, username: 1});
      data.settingsData = {
        applicationForm,
        applicant,
        fund,
        users,
        members
      };
    }
		await next();
	})
  .use('/member', memberRouter.routes(), memberRouter.allowedMethods());
module.exports = settingsRouter;