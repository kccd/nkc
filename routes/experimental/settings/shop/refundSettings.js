const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {data, db} = ctx;
    const shopSettings = await db.SettingModel.findOnly({_id: "shop"});
    data.shopSettings = shopSettings.c;
    ctx.template = 'experimental/shop/refund/settings.pug';
    await next();
  })
  .patch("/", async (ctx, next) => {
    const {db, body} = ctx;
    let {cert, sellerReceive, buyerReceive, agree, buyerTrack, sellerTrack, pay} = body.shopSettings.refund;
    var checkNum = (num) => {
      num = Number(num);
      if(num > 0) {
        return num;
      } else {
        ctx.throw(400, "时间限制必须大于0");
      }
    };
    cert = checkNum(cert);
    sellerReceive = checkNum(sellerReceive);
    buyerReceive = checkNum(buyerReceive);
    agree = checkNum(agree);
    track = checkNum(track);
    await db.SettingModel.update({_id: "shop"}, {$set: {
      "c.refund": {
        cert,
        sellerReceive,
        buyerReceive,
        agree,
        buyerTrack,
        sellerTrack,
        pay
      }
    }});
    await next();
  }); 
module.exports = router;