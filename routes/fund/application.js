const Router = require('koa-router');
const applicationRouter = new Router();
applicationRouter
	.use('/:_id', async (ctx, next) => {
		const {data, db} = ctx;
		const {_id} = ctx.params;
		const applicationForm = await db.FundApplicationFormModel.findOnly({_id});
		await applicationForm.extendMembers();
		await applicationForm.extendApplicant();
		await applicationForm.extendProject();
		await applicationForm.extendThreads();
		const fund = await applicationForm.extendFund();
		data.applicationForm = applicationForm;
		data.fund = fund;
		await next();
	})
  .get('/:_id/settings', async (ctx, next) => {
  	const {data, db} = ctx;
  	const {user, applicationForm, fund} = data;
  	let {s} = ctx.query;
  	if(s) {
  		s = parseInt(s);
	  } else {
  		s = 1;
	  }
	  data.s = s;
  	if(s === 4) {

	  }
	  if(user.uid !== applicationForm.uid && data.userLevel < 7) ctx.throw(401, '权限不足');
		ctx.template = 'interface_fund_apply.pug';
  	await next();
  })
	.get('/:_id/member', async (ctx, next) => {
		const {data, db, params} = ctx;
		const {_id} = params;
		const {user, applicationForm, fund} = data;
		const members = await applicationForm.members;
		for (let u of members) {
			if(u.uid === user.uid) {
				data.member = u;
			}
		}
		ctx.template = 'interface_fund_member.pug';
		await next();
	})
	.patch('/:_id/member', async (ctx, next) => {
		const {data, body} = ctx;
		const {user, applicationForm} = data;
		const {agree} = body;
		const {members} = applicationForm;
		for (let u of members) {
			if(user.uid === u.uid) {
				await u.update({agree})
			}
		}
		await next();
	})
	.patch('/:_id', async (ctx, next) => {
		const {data, db, body, params} = ctx;
		const {newMembers, account, newApplicant, s, project, projectCycle, budgetMoney} = body;
		data.s = s;
		const {user, applicationForm} = data;
		const {_id} = params;
		if(user.uid !== applicationForm.uid && data.userLevel < 7) ctx.throw(401, '权限不足');
		let updateObj;
		const {applicant, members} = applicationForm;
		if(s === 1) {
			// 判断申请人的信息是否存在，不存在则写入
			if(!applicant) {
				newMembers.push({
					uid: user.uid,
					username: user.username
				});
			}
			const membersUid = members.map(m => m.uid);
			const selectedUserUid = newMembers.map(s => s.uid);
			// 从数据库中删除未被选择的用户
			for(let u of members) {
				if(!selectedUserUid.includes(u.uid)) await u.remove();
			}
			// 写入新提交的数据库中不存在的用户信息
			for(let u of newMembers) {
				if(!membersUid.includes(u.uid)) {
					const targetUser = await db.UserModel.findOnly({username: u.username, uid: u.uid});
					const targetUserPersonal = await db.UsersPersonalModel.findOnly({uid: targetUser.uid});
					const {mobile, privateInfo} = targetUserPersonal;
					const {name, idCardNumber, idCardPhotos, handheldIdCardPhoto, certsPhotos, lifePhotos} = privateInfo;
					const newApplicationUser = db.FundApplicationUserModel({
						uid: targetUser.uid,
						applicationFormId: _id,
						name,
						idCardNumber,
						idCardPhotos,
						handheldIdCardPhoto,
						certsPhotos,
						lifePhotos,
						mobile
					});
					await newApplicationUser.save();
				}
			}
			updateObj = {
				'status.chooseType': true
			}
		}
		if(s === 2) {
			await applicant.update(newApplicant);
			updateObj = {
				account,
				'status.inputApplicantMessages': true
			};
		}
		if(s === 3) {
			updateObj = {
				'status.ensureUsersMessages': true
			}
		}
		if(s === 4) {
			if(applicationForm.project === null){
				await applicationForm.newProject(project);
				updateObj = {
					'status.inputProjectContent': true,
					projectId: applicationForm.project._id
				}
			} else {
				await applicationForm.project.update(project);
				data.redirect = `/fund/a/${applicationForm._id}/settings?s=4`;
			}
		}
		if (s === 5) {
			await applicationForm.update({projectCycle, budgetMoney});
		}
		await applicationForm.update(updateObj);
		await next();
	})
	.del('/:_id', async (ctx, next) => {
		const {data} = ctx;
		const {user, applicationForm} = data;
		if(user.uid !== applicationForm.uid && data.userLevel < 7) ctx.throw(401, '权限不足');
		await applicationForm.applicant.remove();
		await Promise.all(applicationForm.members.map(u => u.remove()));
		await applicationForm.remove();
		await next();
	});
module.exports = applicationRouter;
