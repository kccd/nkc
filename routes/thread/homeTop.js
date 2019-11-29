const Router = require('koa-router');
const homeTopRouter = new Router();
homeTopRouter
	.get("/", async (ctx, next) => {
		const {params, db, data} = ctx;
		const {tid} = params;
		const homeSettings = await db.SettingModel.getSettings("home");
		const adsId = homeSettings.ads.fixed.concat(homeSettings.ads.movable).map(t => t.tid);
		if(adsId.includes(tid)) ctx.throw(400, "文章已经被推送到首页了");
		const thread = await db.ThreadModel.findOnly({tid});
		const firstPost = await db.PostModel.findOnly({pid: thread.oc});
		const resources = await db.ResourceModel.find({references: firstPost.pid, mediaType: "mediaPicture"});
		data.thread = {
			title: firstPost.t,
			resourcesId: resources.map(r => r.rid),
			firstPostCover: firstPost.cover,
			tid: thread.tid
		};
		ctx.template = "thread/homeTop/homeTop.pug";
		await next();
	})
	.post('/', async (ctx, next) => {
		const {params, db, body, nkcModules} = ctx;
		const {tid} = params;
		const homeSettings = await db.SettingModel.getSettings("home");
		const {movable, fixed} = homeSettings.ads;
		const ads = movable.concat(fixed);
		const adsId = ads.map(a => a.tid);
		if(adsId.includes(tid)) ctx.throw(400, "文章已经被推送到首页了");
		const {cover} = body.files;
		const {title, topType} = body.fields;
		if(!["movable", "fixed"].includes(topType)) ctx.throw(400, `指定类型不正确，topType: ${topType}`);
		nkcModules.checkData.checkString(title, {
			name: "标题",
			minLength: 1,
			maxLength: 500
		});
		await nkcModules.file.saveHomeAdCover(cover, topType);
		const newTop = {
			title,
			tid,
			cover: cover.hash
		};
		if(topType === "movable") {
			movable.unshift(newTop);
		} else {
			fixed.unshift(newTop);
		}
		await db.SettingModel.updateOne({_id: "home"}, {
			$set: {
				"c.ads.fixed": fixed,
				"c.ads.movable": movable
			}
		});
		await db.SettingModel.saveSettingsToRedis("home");
		/*const thread = await db.ThreadModel.findOnly({tid});
		const homeSettings = await db.SettingModel.findOnly({_id: 'home'});
		if(homeSettings.c.ads.includes(thread.tid)) ctx.throw(400, '文章已被置顶');
		const post = await thread.extendFirstPost();
		if(!post.cover) ctx.throw(400, '文章没有封面图，暂不能在首页置顶显示');
		await homeSettings.update({$addToSet: {'c.ads': thread.tid}});
		await db.SettingModel.saveSettingsToRedis("home");*/
		await next();
	})
	.del('/', async (ctx, next) => {
		const {params, db} = ctx;
		const {tid} = params;
		const homeSettings = await db.SettingModel.getSettings("home");
		let {movable, fixed} = homeSettings.ads;
		for(let i = 0; i < movable.length; i++) {
			if(movable[i].tid === tid) {
				movable.splice(i, 1);
				break;
			}
		}
		for(let i = 0; i < fixed.length; i++) {
			if(fixed[i].tid === tid) {
				fixed.splice(i, 1);
				break;
			}
		}
		await db.SettingModel.updateOne({_id: "home"}, {
			$set: {
				"c.ads.movable": movable,
				"c.ads.fixed": fixed
			}
		});
		await db.SettingModel.saveSettingsToRedis("home");
		await next();
	});
module.exports = homeTopRouter;