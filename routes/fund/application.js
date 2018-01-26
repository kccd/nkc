const Router = require('koa-router');
const applicationRouter = new Router();
const apiFn = require('../../nkcModules/apiFunction');
applicationRouter
	.get('/', async (ctx, next) => {
		const {data, db, query} = ctx;
		const page = query.page?parseInt(query.page): 0;
		const {type} = query;
		const q = {
			useless: {$ne: 'disabled'},
			'status.submitted': true
		};
		if(type === excellent) { // 优秀项目
			q['status.excellent'] = true;
		} else if(type === 'completed') { // 已完成
			q['status.complete'] = true;
		} else if(type === 'funding') { // 资助中
			q['status.complete'] = {$ne: true};
			q['status.remittance'] = true;
		} else if(type === 'auditing') { // 审核中
			q['status.remittance'] = {$ne: true};
		} else { //所有

		}
		const length = await db.FundApplicationFormModel.count(q);
		const paging = apiFn.paging(page, length);
		data.paging = paging;
		const applicationForms = await db.FundApplicationFormModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
		data.applicationForms = await Promise.all(applicationForms.map(async a => {
			await a.extendProject();
			await a.extendMembers();
			await a.extendApplicant();
			await a.extendFund();
			return a;
		}));
		ctx.template = 'interface_fund_applicationForm_list.pug';
		await next();
	})
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
		if(user.uid !== applicationForm.uid && data.userLevel < 7) {
			applicant.idCardNumber = null;
			applicant.mobile = null;
			applicationForm.account.paymentMethod = null;
			applicationForm.account.number = null;
		}
		data.applicationForm = applicationForm;
		data.fund = applicationForm.fund;
		await next();
	})

	// 申请表展示页
	.get('/:_id', async (ctx, next) => {
		const {data} = ctx;
		const {user, applicationForm} = data;
		const {applicant, members} = applicationForm;
		const membersId = members.map(m => m.uid);
		// 未提交时仅自己和全部组员可见
		if(applicationForm.status.submitted !== true && user.uid !== applicant.uid && !membersId.includes(user.uid)) ctx.throw(401, '权限不足');
		ctx.template = 'interface_fund_applicationForm.pug';
		await next();
	})

	//修改申请表
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
					await aUser.update({removed: true});
				}
				await applicationForm.update({from: 'personal'});
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
					applicationFormId: applicationForm._id,
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
	// 废弃申请
	.del('/:_id', async (ctx, next) => {
		const {data, query} = ctx;
		const {user, applicationForm} = data;
		const {type} = query;
		if(['disabled', 'null'].includes(type)) {
			if(data.userLevel < 7){
				ctx.throw(401, '您没有权限操作别人的基金申请！');
			}
		} else if(['revoked', 'exceededModifyCount'].includes(type)){
			if(user.uid !== applicationForm.uid && data.userLevel < 7) ctx.throw(401, '权限不足')
		} else {
			ctx.throw(400, '未知的操作类型！');
		}
		await applicationForm.update({useless: type});
		await next();
	})

	//基金申请表修改页面
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

	// 组员处理组队邀请
	.patch('/:_id/member', async (ctx, next) => {
		const {data, body} = ctx;
		const {user, applicationForm} = data;
		const {agree} = body;
		const {members} = applicationForm;
		for (let u of members) {
			if(u.agree === null && user.uid === u.uid) {
				await u.update({agree})
			}
		}
		await next();
	})

	//网友支持或反对
	.post('/:_id/vote', async (ctx, next) => {
		const {data, body} = ctx;
		const {type} = body;
		const {user, applicationForm} = data;
		const {fund, members, supportersId, objectorsId} = applicationForm;
		const membersId = members.map(m => m.uid);
		membersId.push(applicationForm.uid);
		if(membersId.includes(user.uid)) ctx.throw(401, '抱歉！您已参与该基金的申请，无法完成该操作！');
		if(supportersId.includes(user.uid) || objectorsId.includes(user.uid)) ctx.throw(400, '抱歉！您已经投过票了。');
		if(type === 'support') {
			supportersId.push(user.uid);
		} else if(type === 'against') {
			objectorsId.push(user.uid);
		}
		await applicationForm.save();

		//获得的网友
		if(fund.supportCount <= supportersId.length) {
			await applicationForm.update({'status.usersSupport': true});
		}
		await next();
	})
	.get('/:_id/audit', async (ctx, next) => {
		const {data, query} = ctx;
		const {user, applicationForm} = data;
		const {type} = query;
		data.type = type;
		if(type === 'project') {
			const {fund, lock} = applicationForm;
			const {certs, appointed} = fund.censor;
			for(let cert of certs) { // 不合理的证书判断
				if(!user.certs.includes(cert) && !appointed.includes(user.uid)) ctx.throw(401, '权限不足');
			}
			if(applicationForm.status.projectPassed !== null) ctx.throw(400, '抱歉！该申请表已被其他审查员审核。');
			const {auditing, uid, timeToOpen, timeToClose} = lock;
			const {timeOfAudit} = ctx.settings.fund;
			if(!auditing || (Date.now - timeToOpen) > timeOfAudit) { // 没有人正在审核或审核超时
				lock.uid = user.uid;
				lock.timeToOpen = Date.now();
				lock.timeToClose = null;
				lock.auditing = true;
				await applicationForm.save();
			} else { // 有人正在审核且未超时
				//若审查员是自己则继续审核
				if(user.uid !== uid) ctx.throw(400, '抱歉！该申请正在被其他审查员审核。')
			}
		} else if(type === 'admin'){

		} else {

		}
		ctx.template = 'interface_fund_audit.pug';
		await next();
	})
	.post('/:_id/audit', async (ctx, next) => {
		const {data, body} = ctx;
		const {user, applicationForm} = data;
		const {fund} = applicationForm;
		const {certs, appointed} = fund.censor;
		for(let cert of certs) { // 不合理的证书判断
			if(!user.certs.includes(cert) && !appointed.includes(user.uid)) ctx.throw(401, '权限不足');
		}
		if(applicationForm.status.projectPassed !== null) ctx.throw(400, '抱歉！该申请表已被其他审查员审核。');
		const {uid} = lock;
		if(user.uid !== uid) {
			ctx.throw(400, '抱歉！您的审核已经超时啦，该申请正在被其他审查员审核。');
		}
		lock.timeToClose = Date.now();
		lock.auditing = false;
		const {comment, support} = body;
		await applicationForm.newComment({
			uid: user.uid,
			userType: 'projectCensor',
			t: comment.t,
			c: comment.c,
			support,
		});
		applicationForm.status.projectPassed = support;
		await applicationForm.save();
		await next();
	});
module.exports = applicationRouter;