const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {data, db} = ctx;
    const {user} = data;
    data.waterSetting = {
      waterAdd: true,
      waterStyle: "siteLogo",
      waterGravity: "southeast",
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
    data.hasColumn = !!column;
    ctx.template = "interface_user_settings_apps.pug";
    await next();
  })
  .patch("/", async (ctx, next) => {
    const {db, body, data} = ctx;
    const {homeThreadList, showEnvelope} = body;
    if(!["latest", "subscribe"].includes(homeThreadList)) ctx.throw(400, `首页内容设置错误，未知类型：${homeThreadList}`);
    const q = {
      "displaySettings.homeThreadList": homeThreadList,
      "lotterySettings.close": !showEnvelope
    };
    if(!showEnvelope) {
      q["lotterySettings.status"] = false;
    }
    console.log(q);
    await db.UsersGeneralModel.updateOne({uid: data.user.uid}, {
      $set: q
    });
    await next();
  });
module.exports = router;