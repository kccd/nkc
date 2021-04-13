const Router = require('koa-router');
const router = new Router();
router
	.get('/', async (ctx ,next) => {
		const {nkcModules, query, data, db} = ctx;
		const {page=0} = query;
		const q = {
			'status.submitted': {$ne: true}
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
		data.type = 'unSubmit';
		await next();
	});
module.exports = router;