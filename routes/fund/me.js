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
				if(user.uid !== applicationForm.uid && applicationForm.disabled === false && applicationForm.useless === null) newNotify++;
			}
		}));
		let q = {};
		if(type === 'created' || type === undefined) {
			q.uid = user.uid;
		} else if(type === 'join') {
			q._id = {$in: idArr};
			q.uid = {$ne: user.uid};
		} else if(type === 'notify') {
			q._id = {$in: idArr};
			q.uid = {$ne: user.uid};
			q.disabled = false;
			q.useless = null;
		}
		const length = await db.FundApplicationFormModel.count(q);
		const paging = apiFn.paging(page, length);
		const applicationForms = await db.FundApplicationFormModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
		data.applicationForms = await Promise.all(applicationForms.map(async a => {
			await a.extendFund();
			if(a.fund) {
				await a.extendMembers();
				await a.extendApplicant();
				await a.extendProject()
			}
		}));
		data.newNotify = newNotify;
		data.paging = paging;
		await next();
	});
module.exports = meRouter;