const Router = require('koa-router');
const applicationRouter = new Router();
applicationRouter
	.use('/:_id', async (ctx, next) => {
		const {data, db} = ctx;
		const {_id} = ctx.params;
		const applicationForm = await db.FundApplicationFormModel.findOnly({_id});
		await applicationForm.extendMembers();
		await applicationForm.extendApplicant().then(u => u.extendLifePhotos());
		await applicationForm.extendProject();
		await applicationForm.extendThreads();
		await applicationForm.extendFund();
		const {user} = data;
		const {applicant} = applicationForm;
		// 信息过滤
		if(user.uid !== applicationForm.uid) {
			applicant.idCardNumber = null;
			applicant.mobile = null;
			applicationForm.account.paymentMethod = null;
			applicationForm.account.number = null;
		}
		data.applicationForm = applicationForm;
		data.fund = applicationForm.fund;
		await next();
	})
	.get('/:_id', async (ctx, next) => {
		const {data, applicationForm} = ctx;
		const {user} = data;
		const {applicant, members} = applicationForm;
		const membersId = members.map(m => m.uid);
		// 未提交时仅自己和全部组员可见
		if(applicationForm.status.submitted !== true && user.uid !== applicant.uid && !membersId.includes(user.uid)) ctx.throw(401, '权限不足');
		ctx.template = 'interface_fund_applicationForm.pug';
		await next();
	})
  .get('/:_id/settings', async (ctx, next) => {
  	const {data, db} = ctx;
  	const {user, applicationForm} = data;
  	let {s} = ctx.query;
  	if(s) {
  		s = parseInt(s);
	  } else {
  		s = 1;
	  }
	  data.s = s;
	  if(user.uid !== applicationForm.uid && data.userLevel < 7) ctx.throw(401, '权限不足');
	  const userPersonal = await db.UsersPersonalModel.findOnly({uid: applicationForm.uid});
	  data.lifePhotos = await userPersonal.extendLifePhotos();
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
		const {user} = data;
		const {newMembers, account, newApplicant, s, project, projectCycle, budgetMoney, threadsId} = body;
		data.s = s;
		const {applicationForm} = data;
		if(applicationForm.status.submitted) ctx.throw(401, '无法修改已提交的申请表，若需要修该请先撤销申请！');
		const {_id} = params;
		if(user.uid !== applicationForm.uid) ctx.throw(401, '权限不足');
		const fund = applicationForm.fund;
		try {
			await fund.ensureUserPermission(user);
		} catch(e) {
			ctx.throw(401, e);
		}
		if(fund.reviseCount <= applicationForm.modifyCount) ctx.throw(400, '该申请表修改次数已超过限制，已废弃');
		const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
		const {applicant, members} = applicationForm;
		let updateObj = {};
		if(s === 1) {
			const {from} = body;
			if(from === 'personal') {
				for (let aUser of members) {
					await aUser.remove();
					await applicationForm.update({from: 'personal'});
				}
			} else {
				// 判断申请人的信息是否存在，不存在则写入
				if(!applicant) {
					newMembers.push({
						uid: user.uid,
						mobile: userPersonal.mobile || null
					});
				}
				const membersUid = members.map(m => m.uid);
				const selectedUserUid = newMembers.map(s => s.uid);
				// 从数据库中标记未被选择的用户
				for(let u of members) {
					if(!selectedUserUid.includes(u.uid)) await u.update({removed: true});
				}
				// 写入新提交的数据库中不存在的用户信息
				for(let u of newMembers) {
					if(!membersUid.includes(u.uid)) {
						const targetUser = await db.UserModel.findOnly({uid: u.uid});
						const targetUserPersonal = await db.UsersPersonalModel.findOnly({uid: targetUser.uid});
						const {mobile} = targetUserPersonal;
						const authLevel = await targetUserPersonal.getAuthLevel();
						const newApplicationUser = db.FundApplicationUserModel({
							uid: targetUser.uid,
							applicationFormId: _id,
							mobile,
							authLevel
						});
						await newApplicationUser.save();
					}
				}
				await applicationForm.update({from: 'team'});
			}
		}
		// 填写申请人信息
		if(s === 2) {
			const oldLifePhotos = applicant.lifePhotosId;
			const newLifePhotos = newApplicant.lifePhotosId;
			for (let _id of oldLifePhotos) {
				if(!newLifePhotos.includes(_id)) {
					const photo = await db.PhotoModel.findOne({_id});
					if(!photo) continue;
					if(photo.type === 'fund') {
						await photo.remove();
					}
				}
			}
			for (let i = 0; i < newLifePhotos.length; i++) {
				const _id = newLifePhotos[i];
				const photo = await db.PhotoModel.findOne({_id, status: {$nin: ['disabled', 'deleted']}, type: {$ne: 'fund'}});
				if(!photo) continue;
				const {photoPath, photoSmallPath, generateFolderName} = ctx.settings.upload;
				const newId = await db.SettingModel.operateSystemID('photos', 1);
				const {size, uid, fileName, description} = photo;
				const photoDir = generateFolderName(photoPath);
				const photoSmallDir = generateFolderName(photoSmallPath);
				const filePath = newId + '.jpg';
				const targetPath = photoPath + photoDir + filePath;
				const smallTargetPath = photoSmallPath + photoSmallDir+ filePath;
				await ctx.fs.copyFile(photoPath + photo.path, targetPath);
				await ctx.fs.copyFile(photoSmallPath + photo.path, smallTargetPath);
				const newPhoto = new db.PhotoModel({
					_id: newId,
					type: 'fund',
					path: photoDir + filePath,
					uid,
					size,
					fileName,
					description
				});
				await newPhoto.save();
				newApplicant.lifePhotosId.splice(i, 1, newId);
			}
			await applicant.update(newApplicant);
			updateObj = {
				account,
			};
			await applicationForm.update(updateObj);
		}
		// 填写项目信息
		if(s === 3) {
			if(applicationForm.projectId === null){
				await applicationForm.newProject({
					t: '',
					c: ''
				});
				updateObj = {
					projectId: applicationForm.project._id
				};
				await applicationForm.update(updateObj);
			} else {
				if(project !== undefined){
					await applicationForm.project.update(project);
					data.redirect = `/fund/a/${applicationForm._id}/settings?s=3`;
				}
			}
		}
		//填写其他信息
		if(s === 4) {
			if(projectCycle) updateObj.projectCycle = projectCycle;
			if(budgetMoney) updateObj.budgetMoney = budgetMoney;
			if(threadsId) updateObj['threadsId.applying'] = threadsId;
			await applicationForm.update(updateObj);
		}
		//最后提交验证
		if(s === 5) {
			try{
				await applicationForm.ensureInformation();
			} catch(err) {
				ctx.throw(400, err);
			}
		}
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