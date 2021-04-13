const router = require("koa-router")();
router
  .get("/", async (ctx, next) => {
    const {data, db, query, nkcModules} = ctx;
    const {page = 0, c} = query;
    const q = {};
    data.c = c;
    try{
      if(c) {
        let obj = decodeURIComponent(Buffer.from(c, "base64").toString());
        const {
          orderId, userType, userContent, tUserType, tUserContent
        } = JSON.parse(obj);
        if(orderId) {
          q.orderId = orderId;
        } 
        if(userContent) {
          let buyUid;
          if(userType === "username") {
            const user = await db.UserModel.findOne({usernameLowerCase: userContent.toLowerCase()});
            if(!user) {
              buyUid = "null";
            } else {
              buyUid = user.uid;
            }  
          } else {
            buyUid = userContent;
          }
          q.buyUid = buyUid;
        }
        if(tUserContent) {
          let sellUid;
          if(tUserType === "username") {
            const user = await db.UserModel.findOne({usernameLowerCase: tUserContent.toLowerCase()});
            if(!user) {
              sellUid = "null";
            } else {
              sellUid = user.uid;
            }  
          } else {
            sellUid = tUserContent;
          }
          q.sellUid = sellUid;
        } 
      }
    } catch(err) {
      console.log(err);
      q.buyUid = "null";
    }
    const count = await db.ShopOrdersModel.countDocuments(q);
    const paging = nkcModules.apiFunction.paging(page, count);
    const orders = await db.ShopOrdersModel.find(q).sort({orderToc: -1}).skip(paging.start).limit(paging.perpage);
    data.orders = await db.ShopOrdersModel.storeExtendOrdersInfo(orders);
    data.paging = paging;
    data.nav = "shop";
    ctx.template = "experimental/log/shop.pug";
    await next();
  });
module.exports = router;