const Router = require('koa-router');
const homeTopRouter = new Router();

function isIncludes(arr, id) {
	for(const a of arr) {
		if(a.id === id) return true;
	}
	return false;
}

homeTopRouter
	.use('/', async (ctx, next) => {
		const {body, query, data} = ctx;
    const type = body.type || query.type;
    if(type === 'latest') {
      data.valueName = 'latestToppedThreadsId';
    } else if(type === 'community') {
      data.valueName = 'communityToppedThreadsId';
    } else {
      data.valueName = 'toppedThreadsId';
    }
		await next();
	})
	.post('/', async (ctx, next) => {
		//文章首页顶置
		const {params, db, data} = ctx;
		const {tid} = params;
		const {valueName} = data;
		const obj = {};
		const homeSettings = await db.SettingModel.getSettings('home');
		const threads = homeSettings[valueName];
		if(!isIncludes(threads, tid)) threads.unshift({
			type: 'thread',
			Id: tid,
		});
		obj[`c.${valueName}`] = threads;
		await db.SettingModel.updateOne({_id: "home"}, {
			$set: obj
		});
		await db.SettingModel.saveSettingsToRedis("home");
		await next();
	})
	.del('/', async (ctx, next) => {
		//取消文章首页顶置
		const {params, db, data} = ctx;
		const {tid} = params;
		const {valueName} = data;
		const obj = {};
		obj[`c.${valueName}`] = {
			type: 'thread',
			id: tid,
		};
		await db.SettingModel.updateOne({_id: "home"}, {
			$pull: obj
		});
		await db.SettingModel.saveSettingsToRedis("home");
		await next();
	});
module.exports = homeTopRouter;
