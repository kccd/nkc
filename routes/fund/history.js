const Router = new Router();
const historyRouter = new Router();
historyRouter
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		data.histories = await db.FundModel.find({history: true});
		await next();
	});
module.exports = historyRouter;