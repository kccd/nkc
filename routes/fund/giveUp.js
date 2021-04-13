const Router = require('koa-router');
const router = new Router();
router
	.get('/', async (ctx ,next) => {
		const {nkcModules, query, data, db} = ctx;
		const {page=0} = query;
		const q = {
			'useless': 'giveUp'
		};
		const count = await db.FundApplicationFormModel.countDocuments(q);
		const paging = nkcModules.apiFunction.paging(page, count);
		const applicationForm = await db.FundApplicationFormModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
		await Promise.all(applicationForm.map(async a => {
			await a.extendApplicant();
			await a.extendProject();
			await a.extendFund();
		}));
		data.paging = paging;
		data.applicationForms = applicationForm;
		ctx.template = 'fund/applicationFormsList.pug';
		data.type = 'giveUp';
		await next();
	});
module.exports = router;