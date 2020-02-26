const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    ctx.template = "experimental/login/login.pug";
    await next();
  })
  .post("/", async (ctx, next) =>{
    const {data, body, db, nkcModules} = ctx;
    const {password} = body;
    const userPersonal = await db.UsersPersonalModel.findOnly({uid: data.user.uid});
    await userPersonal.ensurePassword(password);
    ctx.setCookie("experimental", {
      uid: data.user.uid,
      time: Date.now()
    });
    data.redirect = "/e/console";
    // const urls = ctx.getCookie("visitedUrls");
    // ctx.setCookie("experimental", {
    //   uid: data.user.uid,
    //   time: Date.now()
    // });
    // if(!urls || urls.length === 0) {
    //   data.redirect = "/e";
    // } else if(urls[0].indexOf("/e") === -1){
    //   data.redirect = "/e";
    // } else {
    //   data.redirect = urls[0];
    // }
    await next();
  });
module.exports = router;