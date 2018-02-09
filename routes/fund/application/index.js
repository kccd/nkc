const Router = require('koa-router');
const auditRouter = require('./audit');
const remittanceRouter= require('./remittance');
const reportRouter = require('./report');
const completeRouter = require('./complete');
const voteRouter = require('./vote');
const commentRouter = require('./comment');
const settingsRouter = require('./settings');
const memberRouter = require('./member');
const excellentRouter = require('./excellent');
const disabledRouter = require('./disabled');
const applicationRouter = new Router();
const apiFn = require('../../../nkcModules/apiFunction');
applicationRouter
	.get('/', async (ctx, next) => {
		const {data, db, query} = ctx;
		const page = query.page?parseInt(query.page): 0;
		const {type} = query;
		const q = {
			disabled: false,
			'status.submitted': true
		};
		if(type === 'excellent') { // 优秀项目
			q['status.excellent'] = true;
		} else if(type === 'completed') { // 已完成
			q['status.complete'] = true;
		} else if(type === 'funding') { // 资助中
			q['status.complete'] = {$ne: true};
			q['status.adminSupport'] = true;
		} else if(type === 'auditing') { // 审核中
			q['status.remittance'] = {$ne: true};
			q.useless = null
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
		let applicationForm = await db.FundApplicationFormModel.findOne({code: _id});
		if(!applicationForm) {
			applicationForm = await db.FundApplicationFormModel.findOne({_id: _id});
			if(!applicationForm) ctx.throw(400, '未找到指定申请表。');
		}
		await applicationForm.extendFund();
		await applicationForm.extendMembers();
		await applicationForm.extendApplicant().then(u => u.extendLifePhotos());
		await applicationForm.extendProject();
		if(applicationForm.project) {
			await applicationForm.project.extendResources();
		}
		await applicationForm.extendThreads();
		await applicationForm.extendForum();
		const {fund, budgetMoney} = applicationForm;
		if(fund.money.fixed) {
			applicationForm.money = fund.money.fixed;
			applicationForm.factMoney = fund.money.fixed;
		} else {
			let money = 0;
			let factMoney = 0;
			if(budgetMoney !== null && budgetMoney.length !== 0 && typeof budgetMoney !== 'string'){
				for (let b of applicationForm.budgetMoney) {
					money += (b.count*b.money);
					factMoney += b.fact;
				}
			}
			applicationForm.money = money;
			applicationForm.factMoney = factMoney;
		}
		/*const {user} = data;
		const {applicant} = applicationForm;
		// 信息过滤
		if(user.uid !== applicationForm.uid && data.userLevel < 7) {
			applicant.idCardNumber = null;
			applicant.mobile = null;
			applicationForm.account.paymentType = null;
			applicationForm.account.number = null;
		}*/
		data.applicationForm = applicationForm;
		data.fund = applicationForm.fund;
		await next();
	})

	// 申请表展示页
	.get('/:_id', async (ctx, next) => {
		const {data, query, db} = ctx;
		const {user, applicationForm} = data;
		if(applicationForm.disabled && data.userLevel < 7) ctx.throw(401, '抱歉！该申请表已被屏蔽。');
		const {applicant, members} = applicationForm;
		const membersId = members.map(m => m.uid);
		// 未提交时仅自己和全部组员可见
		if(applicationForm.status.submitted !== true && user.uid !== applicant.uid && !membersId.includes(user.uid)) ctx.throw(401, '权限不足');
		ctx.template = 'interface_fund_applicationForm.pug';
		const page = query.page? parseInt(query.page): 0;
		const q = {
			applicationFormId: applicationForm._id,
			type: 'comment'
		};
		if(data.userLevel < 7) q.disabled = false;
		const length = await db.FundDocumentModel.count(q);
		const paging = apiFn.paging(page, length);
		const comments = await db.FundDocumentModel.find(q).sort({toc: 1}).skip(paging.start).limit(paging.perpage);
		await Promise.all(comments.map(async comment => {
			await comment.extendUser();
			await comment.extendResources();
		}));
		applicationForm.comments = comments;
		const auditComments = {};
		if(!applicationForm.status.projectPassed) {
			auditComments.userInfoAudit = await db.FundDocumentModel.findOne({applicationFormId: applicationForm._id, type: 'userInfoAudit', disabled: false}).sort({toc: -1});
			auditComments.projectAudit = await db.FundDocumentModel.findOne({applicationFormId: applicationForm._id, type: 'projectAudit', disabled: false}).sort({toc: -1});
			auditComments.moneyAudit = await db.FundDocumentModel.findOne({applicationFormId: applicationForm._id, type: 'moneyAudit', disabled: false}).sort({toc: -1});
		}
		if(!applicationForm.status.adminSupport) {
			auditComments.adminAudit = await db.FundDocumentModel.findOne({applicationFormId: applicationForm._id, type: 'adminAudit', disabled: false}).sort({toc: -1});
		}
		if(applicationForm.useless === 'giveUp') {
			data.report = await db.FundDocumentModel.findOne({applicationFormId: applicationForm._id, type: 'report', disabled: false}).sort({toc: -1});
		}
		data.auditComments = auditComments;
		data.paging = paging;
		await next();
	})

	//修改申请表
	.patch('/:_id', async (ctx, next) => {
		const {data, db, body, params} = ctx;
		const {user} = data;
		const {useless, newMembers, account, newApplicant, s, project, projectCycle, budgetMoney, threadsId, category} = body;
		data.s = s;
		const {applicationForm} = data;
		if(applicationForm.disabled) ctx.throw(401, '抱歉！该申请表已被屏蔽。');
		if(useless === 'giveUp') {
			ctx.throw(400, '抱歉！您已放弃此次申请。');
		} else if(useless === 'exceededModifyCount') {
			ctx.throw(400, '抱歉！申请表已超出最大修改次数。');
		} else if(useless === 'delete') {
			ctx.throw(401, '抱歉！该申请表已被删除。');
		}
		const {_id} = params;
		if(user.uid !== applicationForm.uid) ctx.throw(401, '权限不足');
		if(applicationForm.lock.submitted) ctx.throw(401, '抱歉！申请表已提交暂不能修改。');
		const fund = applicationForm.fund;
		try {
			await fund.ensureUserPermission(user);
		} catch(e) {
			ctx.throw(401, e);
		}
		const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
		const {applicant, members, status} = applicationForm;
		let updateObj = {
			tlm: Date.now()
		};
		if(applicationForm.modifyCount >= fund.modifyCount) throw '抱歉！申请表的修改次数已超过限制，无法提交修改。';
		if(s === 1) {
			const {from} = body;
			if(status.submitted) ctx.throw(400, '修改失败！申请方式一旦选择将无法更改,如需更改请放弃本次申请重新填写申请表。');
			if(from === 'personal') {
				if(!fund.applicationMethod.personal) ctx.throw(400, '抱歉！该基金暂不允许个人申请。');
				for (let aUser of members) {
					await aUser.update({removed: true});
				}
				updateObj.from = 'personal';
				await applicationForm.update(updateObj);
			} else if(from === 'team') {
				if(!fund.applicationMethod.team) ctx.throw(400, '抱歉！该基金暂不允许团队申请。');
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
				updateObj.from = 'team';
				await applicationForm.update(updateObj);
			} else {
				ctx.throw(400, '未知的申请方式。');
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
			updateObj.account = account;
			await applicationForm.update(updateObj);
		}
		// 填写项目信息
		if(s === 3) {
			if(applicationForm.projectId === null){
				const documentId = await db.SettingModel.operateSystemID('fundDocuments', 1);
				const newDocument = db.FundDocumentModel({
					_id: documentId,
					uid: user.uid,
					applicationFormId: applicationForm._id,
					type: 'project',
					t: project.t,
					abstract: project.abstract
				});
				await newDocument.save();
				updateObj.projectId = documentId;
				await applicationForm.update(updateObj);
			} else {
				if(project !== undefined){
					if(project.t) applicationForm.project.t = project.t;
					if(project.c) applicationForm.project.c = project.c;
					if(project.l) applicationForm.project.l = project.l;
					if(project.abstract) applicationForm.project.abstract = project.abstract;
					await applicationForm.project.save();
					data.redirect = `/fund/a/${applicationForm._id}/settings?s=3`;
				}
			}
		}
		//填写其他信息
		if(s === 4) {
			if(projectCycle) updateObj.projectCycle = projectCycle;
			if(budgetMoney) updateObj.budgetMoney = budgetMoney;
			if(threadsId) updateObj['threadsId.applying'] = threadsId;
			if(category) updateObj.category = category;
			await applicationForm.update(updateObj);
		}
		//最后提交验证
		if(s === 5) {
			if(!fund.canApply) ctx.throw(400, `抱歉！科创基金-${fund.name}已禁止提交新的基金申请。`);
			try{
				applicationForm.lock.submitted = true;
				await applicationForm.ensureInformation();
			} catch(err) {
				ctx.throw(400, err);
			}
		}
		await next();
	})

	.del('/:_id', async (ctx, next) => {
		const {data, query, db} = ctx;
		const {user, applicationForm} = data;
		if(applicationForm.disabled) ctx.throw(401, '抱歉！该申请表已被屏蔽。');
		const {submitted, usersSupport, projectPassed, adminSupport, remittance} = applicationForm.status;
		const {type, c} = query;
		if(type === 'giveUp'){
			if(!c) ctx.throw(400, '请输入放弃的原因。');
			if(user.uid !== applicationForm.uid) ctx.throw(401, '权限不足');
			if(applicationForm.adminSupport) ctx.throw(401, '已经通过审核的申请不能放弃，您可以点击结题按钮提前结题。');
			const newId = await db.SettingModel.operateSystemID('fundDocuments', 1);
			const newDocument = db.FundDocumentModel({
				_id: newId,
				uid: user.uid,
				applicationFormId: applicationForm._id,
				type: 'report',
				c: c
			});
			await newDocument.save();
			applicationForm.useless = 'giveUp';
			applicationForm.status.completed = true;
			applicationForm.timeOfCompleted = Date.now();
		} else if(type === 'delete'){
			if(submitted) ctx.throw(400, '无法删除已提交的申请表，如需停止申请请点击放弃申请按钮。');
			applicationForm.useless = 'delete';
			applicationForm.status.completed = true;
			applicationForm.timeOfCompleted = Date.now();
		} else {
			ctx.throw(400, '未知的操作类型。');
		}
		await applicationForm.save();
		await next();
	})

	.use('/:_id/audit', auditRouter.routes(), auditRouter.allowedMethods())
	.use('/:_id/remittance', remittanceRouter.routes(), remittanceRouter.allowedMethods())
	.use('/:_id/report', reportRouter.routes(), reportRouter.allowedMethods())
	.use('/:_id/complete', completeRouter.routes(), completeRouter.allowedMethods())
	.use('/:_id/vote', voteRouter.routes(), voteRouter.allowedMethods())
	.use('/:_id/comment', commentRouter.routes(), commentRouter.allowedMethods())
	.use('/:_id/settings', settingsRouter.routes(), settingsRouter.allowedMethods())
	.use('/:_id/member', memberRouter.routes(), memberRouter.allowedMethods())
	.use('/:_id/excellent', excellentRouter.routes(), excellentRouter.allowedMethods())
	.use('/:_id/disabled', disabledRouter.routes(), disabledRouter.allowedMethods())
	//屏蔽敏感信息
	.use('/', async (ctx, next) => {
		const {data} = ctx;
		const {user} = data;
		const {applicationForm} = data;
		const {fund} = applicationForm;
		let isCensor = false;
		if(user) {
			for(let c of fund.censor.certs) {
				if(user.certs.includes(c)) isCensor = true;
			}
			if(fund.censor.appointed.includes(user.uid)) isCensor = true;
		}
		if(!user || (applicationForm && data.userLevel < 7 && applicationForm.uid !== user.uid && !isCensor)) {
			const {applicant, members} = applicationForm;
			applicant.mobile = null;
			applicant.idCardNumber = null;
			applicationForm.account.paymentType = null;
			applicationForm.account.number = null;
			for(let m of members) {
				m.mobile = null;
				m.idCardNumber = null;
			}
		}
		await next();
	});
module.exports = applicationRouter;