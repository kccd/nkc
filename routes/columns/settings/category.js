const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    ctx.template = "columns/settings/category.pug";
    const {db, data} = ctx;
    const {column} = data;
    data.categoryTree = await db.ColumnPostCategoryModel.getCategoryTree(column._id);
    data.categoryList = await db.ColumnPostCategoryModel.getCategoryList(column._id);
    data.highlight = "category";
    await next();
  });
module.exports = router;