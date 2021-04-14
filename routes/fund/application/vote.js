const Router = require('koa-router');
const voteRouter = new Router();
voteRouter
	.post('/', async (ctx, next) => {
		const {data, body, db} = ctx;
		const {type, c} = body;
		const {user, applicationForm} = data;
		if(applicationForm.disabled) ctx.throw(403,'抱歉！该申请表已被屏蔽。');
		if(applicationForm.useless !== null) ctx.throw(400, '申请表已失效，无法完成该操作。');
		if(!applicationForm.fund.ensureOperatorPermission('voter', user)) ctx.throw(403,'抱歉！您没有资格进行投票。');
		const {fund, members, supportersId, objectorsId, status} = applicationForm;
		if(!status.submitted) ctx.throw(400, '申请表未提交，暂不能投票。');
		const membersId = members.map(m => m.uid);
		membersId.push(applicationForm.uid);
		if(membersId.includes(user.uid)) ctx.throw(403,'抱歉！您已参与该基金的申请，无法完成该操作！');
		if(supportersId.includes(user.uid) || objectorsId.includes(user.uid)) ctx.throw(400, '抱歉！您已经投过票了。');
		if(type === 'support') {
			supportersId.push(user.uid);
		} else if(type === 'against') {
			objectorsId.push(user.uid);
			if(!c) ctx.throw(400, '请输入反对理由。');
		}
		const newId = await db.SettingModel.operateSystemID('fundDocuments', 1);
		const newDocument = db.FundDocumentModel({
			_id: newId,
			uid: user.uid,
			applicationFormId: applicationForm._id,
			type: 'vote',
			support: type === 'support',
			c
		});
		await newDocument.save();
		await applicationForm.save();

		//获得网友支持
		if(!applicationForm.status.usersSupport && fund.supportCount <= supportersId.length) {
			const obj = {
				'status.usersSupport': true,
				tlm: Date.now()
			};
			if(fund.auditType === 'system') {
				obj['status.projectPassed'] = true;
				obj['status.adminSupport'] = true;
				obj.remittance = [{
					money: this.money,
					status: null
				}];
			}
			await applicationForm.updateOne(obj);

			// 如果是自动审核，当通过网友支持后无需管理员处理，只需要通知用户即可
			if(fund.auditType === 'system') {
			  await db.MessageModel.sendFundMessage(applicationForm._id, "applicant");
      } else {
        // 若是人工审核，通过网友支持后则需要相应专家人员处理
        await db.MessageModel.sendFundMessage(applicationForm._id, "expert");
      }

		}
		await next();
	});
module.exports = voteRouter;