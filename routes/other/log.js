const Router = require('koa-router');
const logRouter = new Router();
logRouter
	.get('/', async (ctx, next) => {
		const time = Date.now();
		const {data, db, query} = ctx;
		const page = query.page?parseInt(query.page): 0;
		const {ip, uid} = query;
		const begin = query.begin?parseInt(query.begin): undefined;
		const end = query.end?parseInt(query.end): undefined;
		data.begin = begin;
		data.end = end;
		data.ip = ip;
		data.uid = uid;
		const q = {};
		if(ip !== undefined) {
			q.ip = ip;
		}
		if(uid !== undefined) {
			q.uid = uid;
		}
		if(begin !== undefined) {
			if(!q.reqTime) {
				q.reqTime = {};
			}
			q.reqTime.$gte = begin;
		}
		if(end !== undefined) {
			if(!q.reqTime) {
				q.reqTime = {};
			}
			q.reqTime.$lte = end;
		}
		const count = await db.LogModel.count(q);
		const {apiFunction} = ctx.nkcModules;
		const paging = apiFunction.paging(page, count);
		data.paging = paging;
		const logs = await db.LogModel.find(q).sort({reqTime: -1}).skip(paging.start).limit(paging.perpage);
		data.logs = await Promise.all(logs.map(async log => {
			await log.extendUser();
			return log;
		}));
		data.time = Date.now() - time;
		ctx.template = 'interface_log.pug';
		data.nav = '日志';
		await next();
	})
	.del('/', async (ctx, next) => {
		const {db, query} = ctx;
		let {begin, end} = query;
		if(begin === undefined) {
			ctx.throw(400, '请输入起始时间。');
		} else {
			begin = parseInt(begin);
		}
		if(end === undefined) {
			ctx.throw(400, '请输入结束时间。');
		} else {
			end = parseInt(end);
		}
		await db.LogModel.deleteMany({reqTime: {$gte: begin, $lte: end}});
		await next();
	});
module.exports = logRouter;