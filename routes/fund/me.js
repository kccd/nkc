const Router = require('koa-router');
const meRouter = new Router();
const apiFn = require('../../nkcModules/apiFunction');
meRouter
	.get('/', async (ctx, next) => {
		const {data, db, query} = ctx;
		const {user} = data;
		const {type} = query;
		const page = query.page? parseInt(query.page): 0;
		ctx.template = 'interface_fund_me.pug';
		data.me = true;
		data.type = type;
		let newNotify = 0;
		const aUsers = await db.FundApplicationUserModel.find({uid: user.uid});
		const idArr = aUsers.map(a => a.applicationFormId);
		await Promise.all(aUsers.map(async a => {
			if(a.agree === null) {
				const applicationForm = await db.FundApplicationFormModel.findOnly({_id: a.applicationFormId});
				if(user.uid !== applicationForm.uid) newNotify++;
			}
		}));
		let q = {
			useless: {$ne: 'disabled'}
		};
		if(type === 'created' || type === undefined) {
			q.uid = user.uid;
		} else {
			q._id = {$in: idArr};
			q.uid = {$ne: user.uid};
		}
		/*let q = {
			uid: user.uid
		};
		if(type === 'funding') { // 资助中
			q['status.completed'] = {$ne: true};
			q['status.adminSupport'] = true;
		} else if(type === 'auditing') { // 审核中
			q['status.submitted'] = true;
			q['status.adminSupport'] = {$ne: true};
		} else if (type === 'draft') { // 草稿
			q['status.submitted'] = {$ne: true};
		} else if (type === undefined) { // 已完成的
			q['status.completed'] = true;
		} else if(type === 'notify') {
			const idArr = aUsers.map(a => a.applicationFormId);
			q._id = {$in: idArr};
			q.uid = {$ne: user.uid};
		}*/
		const length = await db.FundApplicationFormModel.count(q);
		const paging = apiFn.paging(page, length);
		const applicationForms = await db.FundApplicationFormModel.find(q).skip(paging.start).limit(paging.perpage);
		await Promise.all(applicationForms.map(async a => {
			await a.extendMembers();
			await a.extendApplicant();
			await a.extendFund();
			await a.extendProject()
		}));
		data.applicationForms = applicationForms;
		data.newNotify = newNotify;
		await next();
	});
module.exports = meRouter;