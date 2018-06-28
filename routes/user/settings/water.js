const Router = require('koa-router');
const waterRouter = new Router();
waterRouter
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
    const {user} = data;
    data.waterSetting = {
      waterAdd: true,
      waterStyle: "siteLogo",
      waterGravity: "southeast",
      waterPayTime: "",
      waterPayInfo: false
    }
    // 获取该项服务所需科创币
    const waterPayType = await db.TypesOfScoreChangeModel.findOne({_id: "waterPay"})
    data.kcbPayForWater = parseInt(waterPayType.change*-1);
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
    const {body, data, db, port, ip} = ctx;
    const {type, waterAdd, waterGravity, waterStyle} = body;
    const {user} = data;

    if(type === "pay"){
      // 检测是否已经购买了水印服务
      const waterAlreadyPay = await db.UsersGeneralModel.findOne({uid: user.uid})
      if(waterAlreadyPay === null){
        ctx.throw(400,"您已经购买了这项服务");
      }
      if(waterAlreadyPay.waterSetting.waterPayInfo === true){
        ctx.throw(400,"您已经购买了这项服务")
      }
      // 验证科创币
      const waterPayType = await db.TypesOfScoreChangeModel.findOne({_id: "waterPay"})
      if(waterPayType && user.kcb < parseInt(waterPayType.change*-1)){
        ctx.throw(400,"您的科创币不足"+parseInt(waterPayType.change*-1))
      }
      // 消耗科创币，并生成记录
      // const {user, type, typeIdOfScoreChange, port, ip, fid, pid, tid, description} = options;
      // console.log(user)
      const options = {
        user: user,
        type : "kcb",
        typeIdOfScoreChange : "waterPay",
        port: port,
        ip : ip
      }
      await db.UsersScoreLogModel.insertLog(options)
      // 修改水印设置
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