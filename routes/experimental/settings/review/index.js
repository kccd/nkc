const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) =>{
    const {data, db} = ctx;
    ctx.template = "experimental/settings/review/review.pug";
    data.grades = await db.UsersGradeModel.find({}).sort({_id: 1});
    data.certs = await db.RoleModel.find().sort({toc: -1});
    await next();
  })
  .patch("/", async (ctx, next) => {
    const {data, db, body} = ctx;
    await next();
  });
module.exports = router;