const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    ctx.template = "columns/settings/category.pug";
    const {db, data} = ctx;
    const {column} = data;
    data.categoryList = await db.ColumnPostCategoryModel.getCategoryList(column._id);
    data.highlight = "category";
    await next();
  })
  .get("/:categoryId", async (ctx, next) => {
    const {data, db, params} = ctx;
    const {column} = data;
    const {categoryId} = params;
    data.categoryList = await db.ColumnPostCategoryModel.getCategoryList(column._id);
    if(categoryId !== "add") {
      data.category = await db.ColumnPostCategoryModel.findOne({columnId: column._id, _id: categoryId});
    }
    ctx.template = "columns/settings/editCategory.pug";
    await next();
  });
module.exports = router;