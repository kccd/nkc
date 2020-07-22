const Router = require('koa-router');
const router = new Router();
router
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		data.homeSettings = (await db.SettingModel.findOnly({_id: 'home'})).c;
		ctx.template = 'experimental/settings/home.pug';
		data.type = 'logo';
		await next();
	})
	.put('/', async (ctx, next) => {
		const {body, db, nkcModules} = ctx;
		const {id, type, operation} = body;
		const homeSettings = await db.SettingModel.findOnly({_id: 'home'});
		const q = Object.assign({}, homeSettings.c);
		if(operation === 'saveWaterMarkSettings') {
			let {watermarkTransparency, waterLimitMinHeight, waterLimitMinWidth} = body;
      nkcModules.checkData.checkNumber(waterLimitMinWidth, {
        min: 200,
        name: "图片最小宽度"
      });
      nkcModules.checkData.checkNumber(waterLimitMinHeight, {
        min: 200,
        name: "图片最小高度"
      });
			watermarkTransparency = parseInt(watermarkTransparency);
			if(watermarkTransparency >= 0 && watermarkTransparency <= 255) {
				q.watermarkTransparency =  watermarkTransparency;
			} else {
				ctx.throw(400, '水印透明度取值范围为：[ 1, 255 ]');
			}
			q.waterLimit.minHeight = waterLimitMinHeight;
			q.waterLimit.minWidth = waterLimitMinWidth;
		} else if(operation === 'saveLogo') {
			if(type === 'smallLogo') {
				if(homeSettings.c.smallLogo === id) ctx.throw(400, '图片已被设置为默认小图了');
				q.smallLogo = id;
			} else if(type === 'logo') {
				if(homeSettings.c.logo === id) ctx.throw(400, '图片已被设置为默认大图了');
				q.logo = id;
			} else {
				ctx.throw(400, '参数错误');
			}
			if(!homeSettings.c.logos.includes(id)) ctx.throw(400, '图片无效');
		}
		await homeSettings.update({c: q});
		await db.SettingModel.saveSettingsToRedis("home");
		await next();
	})
	.del('/', async (ctx, next) => {
		const {db, query} = ctx;
		const {id} = query;
		const homeSettings = await db.SettingModel.findOnly({_id: 'home'});
		if(homeSettings.c.logo === id || homeSettings.c.smallLogo === id) ctx.throw(400, '暂不能删除默认图片');
		if(!homeSettings.c.logos.includes(id)) ctx.throw(400, '图片无效');
		await homeSettings.update({$pull: {'c.logos': id}});
		await db.SettingModel.saveSettingsToRedis("home");
		await next();
	});
module.exports = router;
