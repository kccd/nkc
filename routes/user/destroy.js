const router = require("koa-router")();
router
  .use("/", async (ctx, next) => {
    const {data, db} = ctx;
    const {user} = data;
    data.regSettings = await db.SettingModel.getSettings("register");
    const {verifyEmail, verifyMobile, verifyPassword} = data.regSettings;
    const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
    data.verifyEmail = verifyEmail && userPersonal.email;
    data.verifyMobile = verifyMobile && userPersonal.mobile;
    data.verifyPassword = verifyPassword && !!userPersonal.hashType;
    if(data.verifyMobile) {
      data.mobile = "+" + userPersonal.nationCode + " " + userPersonal.mobile.slice(0, 3) + "****" + userPersonal.mobile.slice(7);
    }
    if(data.verifyEmail) {
      data.email = userPersonal.email.replace(/.{4}@/ig, "****@");
    }
    const {status, passed} = await db.UserModel.checkStatusForDestroyAccount(user.uid);
    data.passed = passed;
    data.notices = [];
    const obj = {
      "fund": "存在科创基金申请尚未完成或尚未结题",
      "forum": "尚未辞去主管专家职务或辞职申请尚未批准",
      "activity": "发布的活动尚未完成",
      "column": "专栏未关闭",
      "shopSeller": "出售的商品尚未停售或销售订单尚未完成",
      "shopBuyer": "购买商品尚未确认收货",
    };
    for(const key in status) {
      if(!status[key]) {
        data.notices.push(obj[key]);
      }
    }
    await next();
  })
  .get("/", async (ctx, next) => {
    ctx.template = "user/destroy/destroy.pug";
    await next();
  })
  .post("/", async (ctx, next) => {
    const {db, data, body} = ctx;
    const {type, form} = body;
    const {user} = data;
    const {verifyEmail, verifyMobile, verifyPassword} = data;
    const {
      emailCode,
      mobileCode,
      password
    } = form;
    const usersPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});

    let mobileCodeObj, emailCodeObj;
    if(verifyPassword) {
      if(!password) ctx.throw(400, "登录密码不能为空");
      await usersPersonal.ensurePassword(password);
    }
    if(verifyMobile) {
      mobileCodeObj = await db.SmsCodeModel.ensureCode({
        type: "destroy",
        mobile: usersPersonal.mobile,
        nationCode: usersPersonal.nationCode,
        code: mobileCode,
        ip: ctx.address,
      });
    }
    if(verifyEmail) {
      emailCodeObj = await db.EmailCodeModel.ensureEmailCode({
        type: "destroy",
        email: usersPersonal.email,
        token: emailCode
      });
    }
    if(type === "destroy") {
      if(mobileCodeObj) await mobileCodeObj.updateOne({used: true});
      if(emailCodeObj) await mobileCodeObj.updateOne({used: true});
      await db.UserModel.destroyAccount({
        uid: user.uid,
        ip: ctx.address,
        port: ctx.port
      });
      ctx.clearCookie("userInfo");
    }
    await next();
  });
module.exports = router;