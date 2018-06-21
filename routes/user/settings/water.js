const Router = require('koa-router');
const waterRouter = new Router();
waterRouter
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
    const {user} = data;
    data.waterSetting = {
      waterAdd: true,
      waterStyle: "siteLogo",
      waterGravity: "southeast"
    }
    const userWaterSetting = await db.UsersGeneralModel.findOne({uid: user.uid});
    if(userWaterSetting){
      data.waterSetting = userWaterSetting.waterSetting
    }
		ctx.template = 'interface_user_settings_water.pug';
		await next();
	})
	.patch('/', async (ctx, next) => {
    const {body, data, db} = ctx;
    const {waterAdd, waterGravity, waterStyle} = body;
    const {user} = data;
    let option = {};
    option.uid = user.uid;
    option.waterSetting = {
      waterAdd,
      waterGravity,
      waterStyle
    }
    const userWaterSetting = await db.UsersGeneralModel.findOne({uid: user.uid});
    if(userWaterSetting){
      await db.UsersGeneralModel.update({uid:user.uid},{waterSetting:option.waterSetting})
    }else{
      await new db.UsersGeneralModel(option).save()
    }
		await next();
	});
module.exports = waterRouter;