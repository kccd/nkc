const Router = require('koa-router');
const waterRouter = new Router();
waterRouter
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
    const {user} = data;
    data.waterSetting = {
      waterAdd: true,
      pictureWaterStyle: "siteLogo",
      pictureWaterGravity: "southeast",
      videoWaterStyle: "siteLogo",
      videoWaterGravity: "southeast",
      waterPayTime: "",
      waterPayInfo: false
    };
    // 获取该项服务所需科创币
    /*const waterPayType = await db.TypesOfScoreChangeModel.findOnly({_id: "waterPay"});
    data.kcbPayForWater = parseInt(waterPayType.change*-1);*/
    user.kcb = await db.UserModel.updateUserKcb(user.uid);
    const waterPayType = await db.KcbsTypeModel.findOnly({_id: 'waterPay'});
    data.kcbPayForWater = parseInt(waterPayType.num*-1);
    const userWaterSetting = await db.UsersGeneralModel.findOne({uid: user.uid});
    if(userWaterSetting){
      data.waterSetting = userWaterSetting.waterSetting
    }else{
      await new db.UsersGeneralModel({uid:user.uid}).save()
    }
    // 判断用户是否有专栏
    const column = await db.ColumnModel.findOne({uid: user.uid});
    data.hasColumn = false
    if(column) {
      data.hasColumn = true;
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
	.put('/', async (ctx, next) => {
    const {body, data, db, port, ip} = ctx;
    const {type, waterAdd, pictureWaterStyle, pictureWaterGravity, videoWaterStyle, videoWaterGravity} = body;
    const {user} = data;
    if(type === "pay"){
      // 检测是否已经购买了水印服务
      const waterAlreadyPay = await db.UsersGeneralModel.findOne({uid: user.uid});
      if(waterAlreadyPay === null){
        ctx.throw(400,"您已经购买了这项服务");
      }
      if(waterAlreadyPay.waterSetting.waterPayInfo === true){
        ctx.throw(400,"您已经购买了这项服务")
      }
      
      // 上传设置
      const uploadSettings = await db.SettingModel.getSettings('upload');
      // 去水印功能需要的积分数
      let needScore = uploadSettings.watermark.buyNoWatermark;
      // 去水印功能使用的哪种积分
      let scoreObject = await db.SettingModel.getScoreByOperationType("watermarkScore");
      // 更新此用户所有积分
      await db.UserModel.updateUserScores(user.uid);
      // 当前用户持有的积分
      let myScore = await db.UserModel.getUserScore(user.uid, scoreObject.type);
      // 分够不够
      if(needScore && myScore < needScore){
        ctx.throw(400, `您的${scoreObject.name}不足${needScore/100}${scoreObject.unit}`);
      }
      // 够了，生成一条转给银行的转账记录
      await db.KcbsRecordModel({
        _id: await db.SettingModel.operateSystemID("kcbsRecords", 1),
        type: "waterPay",
        from: user.uid,
        to: "bank",
        num: needScore,
        ip: ctx.address,
        port: ctx.port,
        scoreType: scoreObject.type
      }).save();
      // 更新此用户的水印设置
      await db.UsersGeneralModel.updateOne({uid: user.uid}, {
        $set: {
          'waterSetting.waterPayInfo': true,
          'waterSetting.waterPayTime': Date.now(),
          'waterSetting.waterAdd': false
        }
      })
    }
    if(type === "save"){
      const userWaterSetting = await db.UsersGeneralModel.findOne({uid: user.uid});
      if(userWaterSetting){
        await db.UsersGeneralModel.updateOne({uid:user.uid},{$set: {'waterSetting.waterAdd':waterAdd,'waterSetting.picture.waterGravity':pictureWaterGravity,'waterSetting.picture.waterStyle':pictureWaterStyle, 'waterSetting.video.waterGravity':videoWaterGravity,'waterSetting.video.waterStyle':videoWaterStyle,}})
      }else{
        await new db.UsersGeneralModel({uid:user.uid}).save()
      }
    }
    await next();
	});
module.exports = waterRouter;
