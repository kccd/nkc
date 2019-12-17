const router = require("koa-router")();
router
  .get("/", async (ctx, next) => {
    const {data, db} = ctx;
    const {targetUser, user} = data;
    
    await next();
  })
  .post("/", async (ctx, next) => {
    
    await next();
  });
module.exports = router;