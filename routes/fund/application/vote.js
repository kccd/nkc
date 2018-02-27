const Router = require('koa-router');
const voteRouter = new Router();
voteRouter
	.post('/', async (ctx, next) => {
		const {data, body, db} = ctx;
		const {type, c} = body;
		const {user, applicationForm} = data;
		if(applicationForm.disabled) ctx.throw(401, '抱歉！该申请表已被屏蔽。');
		if(applicationForm.useless !== null) ctx.throw(400, '申请表已失效，无法完成该操作。');
		if(!user.certs.includes('mobile')) ctx.throw('401', '您还没有通过实名认证，请前往资料设置页绑定手机号。');
		const {fund, members, supportersId, objectorsId} = applicationForm;
		const membersId = members.map(m => m.uid);
		membersId.push(applicationForm.uid);
		if(membersId.includes(user.uid)) ctx.throw(401, '抱歉！您已参与该基金的申请，无法完成该操作！');
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
			type: 'vote',
			support: type === 'support',
			c
		});
		await newDocument.save();
		await applicationForm.save();

		//获得的网友
		if(fund.supportCount <= supportersId.length) {
			await applicationForm.update({'status.usersSupport': true});
		}
		await next();
	});
module.exports = voteRouter;