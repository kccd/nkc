const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    ctx.template = "columns/settings/category.pug";
    const {db, data} = ctx;
    const {column} = data;
    data.categoryList = await db.ColumnPostCategoryModel.getCategoryList(column._id);
    data.categoryTree = await db.ColumnPostCategoryModel.getCategoryTree(column._id);
    data.minorCategories = await db.ColumnPostCategoryModel.getMinorCategories(column._id);
    data.nav = "category";
    await next();
  })
  .put('/', async (ctx, next) => {
    const {db, body, data} = ctx;
    const {categories} = body;
    const parentId = [];
    const {column} = data;
    categories.map(c => parentId.push(c._id));
    const parentCategories = await db.ColumnPostCategoryModel.find({
      columnId: column._id,
      type: 'main',
      _id: {$in: parentId}
    });
    const parentCategoriesObj = {};
    parentCategories.map(c => parentCategoriesObj[c._id] = c);
    for(const category of categories) {
      let {_id, order, parentId} = category;
      const parentCategory = parentCategoriesObj[parentId];
      if(!parentCategory) parentId = null;
      await db.ColumnPostCategoryModel.updateOne({_id, columnId: column._id}, {
        $set: {
          order,
          parentId
        }
      });
    }
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