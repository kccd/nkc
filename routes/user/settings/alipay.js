const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {data, db} = ctx;
    const {user} = data;
    const usersPersonal = await db.UsersPersonalModel.findById(user.uid);
    data.alipayAccounts = usersPersonal.alipayAccounts;
    ctx.template = "interface_user_settings_alipay.pug";
    await next();
  })
  .post("/", async (ctx, next) => {
    const {data, db, body, tools} = ctx;
    const {type, account, accounts} = body;
    const {contentLength} = tools.checkString;
    const {user} = data;
    const usersPersonal = await db.UsersPersonalModel.findById(user.uid);
    const {alipayAccounts} = usersPersonal;
    if(type === "deleteAccount") {
      for(var i = 0; i < alipayAccounts.length; i++) {
        const a = alipayAccounts[i];
        if(a.account === account.account) {
          if(a.default && alipayAccounts.length > 1) ctx.throw(400, "无法删除默认支付宝账号");
          alipayAccounts.splice(i, 1);
          await db.UsersPersonalModel.update({uid: user.uid}, {
            $set: {
              alipayAccounts
            }
          });
          break;
        }
      }
    } else if(type === "saveAccounts") {
      if(accounts.length > 10) ctx.throw(400, "绑定的支付宝账号不能超过5个");
      const time = Date.now();
      let hasDefault = false;
      for(const a of accounts) {
        const {name, account} = a;
        if(a.default) hasDefault = true;
        if(!account) ctx.throw(400, "支付宝账号不能为空");
        if(!contentLength(account) > 100) ctx.throw(400, "支付宝账号不能超过50字节");
        if(!name) ctx.throw(400, "真实姓名不能为空");
        if(!contentLength(name) > 50) ctx.throw(400, "真实姓名不能超过50字节");
        a.time = time;
      }
      if(!hasDefault && accounts.length) accounts[0].default = true;
      await db.UsersPersonalModel.update({uid: user.uid}, {
        $set: {
          alipayAccounts: accounts
        }
      });
      data.alipayAccounts = accounts;
    }
    await next();
  });

module.exports = router;
