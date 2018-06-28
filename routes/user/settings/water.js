const Router = require('koa-router');
const waterRouter = new Router();
waterRouter
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
    const {user} = data;
    data.waterSetting = {
      waterAdd: true,
      waterStyle: "siteLogo",
      waterStyle: "southeast",
      waterPayTime: "",
      waterPayInfo: false
    }
    const userWaterSetting = await db.UsersGeneralModel.findOne({uid: user.uid});
    if(userWaterSetting){
      data.waterSetting = userWaterSetting.waterSetting
    }else{
      await new db.UsersGeneralModel({uid:user.uid}).save()
    }
    // 判断服务时间是否过期
    // const buyTime = data.waterSetting.waterPayTime
    // console.log(buyTime)
    // if(buyTime !== null){
    //   console.log(buyTime-365*24*60*60*1000)
    // }
		ctx.template = 'interface_user_settings_water.pug';
		await next();
	})
	.patch('/', async (ctx, next) => {
    const {body, data, db} = ctx;
    const {type, waterAdd, waterGravity, waterStyle} = body;
    const {user} = data;

    if(type === "pay"){
      // 验证科创币
      const userInfo = await db.UserModel.findOne({uid: user.uid})
      const userKCB = userInfo.kcb;
      if(userKCB < 200){
        ctx.throw("科创币不足")
      }
      // 购买服务，写入数据
      const paySuccess = {
        waterPayInfo: true,
        waterPayTime: Date.now()
      }
      await db.UsersGeneralModel.update({uid:user.uid},{$set: {'waterSetting.waterPayInfo': true,'waterSetting.waterPayTime':Date.now()}})
    }
    if(type === "save"){
      const userWaterSetting = await db.UsersGeneralModel.findOne({uid: user.uid});
      if(userWaterSetting){
        await db.UsersGeneralModel.update({uid:user.uid},{$set: {'waterSetting.waterAdd':waterAdd,'waterSetting.waterGravity':waterGravity,'waterSetting.waterStyle':waterStyle,}})
      }else{
        await new db.UsersGeneralModel({uid:user.uid}).save()
      }
    }
    await next();
	});
module.exports = waterRouter;