const Router = require("koa-router");
const router = new Router();
router
  .post("/", async (ctx, next) => {
    const {data, db, body, tools} = ctx;
    const {type, account, accounts} = body;
    const {contentLength} = tools.checkString;
    const {user} = data;
    const usersPersonal = await db.UsersPersonalModel.findById(user.uid);
    const {bankAccounts} = usersPersonal;
    if(type === "deleteAccount") {
      for(var i = 0; i < bankAccounts.length; i++) {
        const a = bankAccounts[i];
        if(a.account === account.account) {
          if(a.default && bankAccounts.length > 1) ctx.throw(400, "无法删除默认支付宝账号");
          bankAccounts.splice(i, 1);
          await db.UsersPersonalModel.updateOne({uid: user.uid}, {
            $set: {
              bankAccounts
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
        const {bankName, mobile, name, account} = a;
        if(a.default) hasDefault = true;
        if(!bankName) ctx.throw(400, "银行名称不能为空");
        if(contentLength(bankName) > 50) ctx.throw(400, "银行名称不能超过50字节");
        if(!account) ctx.throw(400, "银行卡号不能为空");
        if(contentLength(account) > 100) ctx.throw(400, "银行卡号不能超过50字节");
        if(!name) ctx.throw(400, "开户姓名不能为空");
        if(contentLength(name) > 50) ctx.throw(400, "开户姓名不能超过50字节");
        if(!mobile) ctx.throw(400, "开户手机号不能为空");
        if(contentLength(mobile) > 50) ctx.throw(400, "开户手机号不能为空");
        a.time = time;
      }
      if(!hasDefault && accounts.length) accounts[0].default = true;
      await db.UsersPersonalModel.updateOne({uid: user.uid}, {
        $set: {
          bankAccounts: accounts
        }
      });
      data.bankAccounts = accounts;
      await next();
    }
  });
module.exports = router;