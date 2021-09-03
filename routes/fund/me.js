const Router = require('koa-router');
const meRouter = new Router();
const apiFn = require('../../nkcModules/apiFunction');
meRouter
	.get('/', async (ctx, next) => {
		const {data, db, query} = ctx;
		const {user} = data;
		const {type = 'created', page = 0} = query;
		data.type = type;
		const q = {};
		if(type === 'created') {
			q.uid = user.uid;
		} else if(type === 'join') {
      const members = await db.FundApplicationUserModel.find({
        type: 'member',
        agree: true,
        uid: user.uid,
        removed: false
      }, {
        applicationFormId: 1
      });
      const applicationFormsId = members.map(m => m.applicationFormId);
			q._id = {$in: applicationFormsId};
			q.uid = {$ne: user.uid};
		} else if(type === 'notify') {
      const members = await db.FundApplicationUserModel.find({
        type: 'member',
        agree: null,
        uid: user.uid,
        removed: false
      }, {
        applicationFormId: 1
      });
      const applicationFormsId = members.map(m => m.applicationFormId);
			q._id = {$in: applicationFormsId};
			q.uid = {$ne: user.uid};
			q.disabled = false;
			q.useless = null;
		}
		const length = await db.FundApplicationFormModel.countDocuments(q);
		const paging = apiFn.paging(page, length);
		const applicationForms = await db.FundApplicationFormModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
		data.applicationForms = await Promise.all(applicationForms.map(async a => {
			await a.extendFund();
			if(a.fund) {
				await a.extendMembers();
				await a.extendApplicant();
				await a.extendProject();
				a.statusString = (await a.getStatus()).description;
				return a;
			}
		}));
		data.paging = paging;
		ctx.template = 'fund/me.pug';
		await next();
	});
module.exports = meRouter;