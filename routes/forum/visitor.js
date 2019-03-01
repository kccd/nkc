const Router = require('koa-router');
const visitorRouter = new Router();
visitorRouter
	.get('/', async (ctx, next) => {
		const {data, db, query} = ctx;
		let {page} = query;
		page = page?parseInt(page): 0;
		let {behaviors} = data;
		const usersId = [];
		for(let b of behaviors) {
			if(!usersId.includes(b.uid)) {
				usersId.push(b.uid);
			}
		}
		const count = usersId.length;
		const {apiFunction} = ctx.nkcModules;
		const paging = apiFunction.paging(page, count);
		data.paging = paging;
		const uid = usersId.slice(paging.start, paging.start + paging.perpage);
		data.visitors = [];
		for(const u of uid) {
			const user = await db.UserModel.findOne({uid: u});
			if(user) {
				data.visitors.push(user);
			}
    }
    await db.UserModel.extendUsersInfo(data.visitors);
		//data.visitors = await Promise.all(uid.map(u => db.UserModel.findOne({uid: u})));
		data.type = 'visitors';
		await next();
	});
module.exports = visitorRouter;