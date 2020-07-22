const router = require("koa-router")();
router
  .get("/", async (ctx, next) => {
    const {data} = ctx;
    data.navType = "settings";
    ctx.template = 'shop/manage/settings/settings.pug';
    await next();
  })
  .put("/", async (ctx, next) => {
    const {nkcModules, data, db, body} = ctx;
    const {user} = data;
    const {
      dealDescription, dealAnnouncement, address, templates, location
    } = body;
    const {checkNumber, checkString} = nkcModules.checkData;
    checkString(dealDescription, {
      name: "供货说明",
      minLength: 0,
      maxLength: 500
    });
    checkString(dealAnnouncement, {
      name: "全局公告",
      minLength: 0,
      maxLength: 500
    });
    if(!location) throw "请选择区域";
    checkString(location, {
      name: "区域",
      minLength: 1,
      maxLength: 500
    });
    if(!address) throw "请输入详细地址";
    checkString(address, {
      name: "详细地址",
      minLength: 1,
      maxLength: 500
    });
    for(const t of templates) {
      const {name, firstPrice, addPrice} = t;
      checkString(name, {
        name: "模板名称",
        minLength: 1,
        maxLength: 100
      });
      checkNumber(firstPrice, {
        name: "首件价格",
        min: 0,
        fractionDigits: 2
      });
      checkNumber(addPrice, {
        name: "首件后每件价格",
        min: 0,
        fractionDigits: 2
      });
    }
    const addressStr = location + "&" + address;
    let dealInfo = data.dealInfo;
    if(!dealInfo) {
      dealInfo = db.ShopDealInfoModel({
        uid: user.uid,
        address: addressStr,
        dealDescription, dealAnnouncement, templates
      });
      await dealInfo.save();
    } else {
      await db.ShopDealInfoModel.updateOne({uid: user.uid}, {
        $set: {
          dealDescription, dealAnnouncement, templates,
          address: addressStr
        }
      });
    }
    await next();
  });
module.exports = router;
