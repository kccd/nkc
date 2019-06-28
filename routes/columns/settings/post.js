const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    ctx.template = "columns/settings/post.pug";
    const {data, db} = ctx;
    const {column} = data;
    const categories = await db.ColumnPostCategoryModel.find({columnId: column._id}).sort({toc: 1});
    data.categories = await db.ColumnPostCategoryModel.extendCategories(categories);
    data.noCategoryCount = await db.ColumnPostModel.count({columnId: column._id, cid: ""});
    data.highlight = "post";
    await next();
  });
module.exports = router;