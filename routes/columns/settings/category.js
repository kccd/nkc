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
      let {parentId} = category;
      const parentCategory = parentCategoriesObj[parentId];
      if(!parentCategory) category.parentId = null;
      /*await db.ColumnPostCategoryModel.updateOne({_id, columnId: column._id}, {
        $set: {
          order,
          parentId
        }
      });*/
    }
    // const categoriesDB = await db.ColumnPostCategoryModel.find({}, {_id: 1, parentId: 1});
    const categoriesDB = categories;
    const parentsObj = {};
    const topCategories = [];
    for(const c of categoriesDB) {
      const {parentId} = c;
      if(parentId) {
        parentsObj[parentId] = parentsObj[parentId] || [];
        parentsObj[parentId].push(c);
      } else {
        topCategories.push(c);
      }
    }
    const func = (arr, level) => {
      for(const c of arr) {
        c.level = level;
        const childCategories = parentsObj[c._id] || [];
        func(childCategories, level + 1);
      }
    };
    func(topCategories, 0);
    categoriesDB.map(category => parentsObj[category._id] = category);
    for(const c of categories) {
      const {_id, order, parentId, level} = c;
      await db.ColumnPostCategoryModel.updateOne({_id, columnId: column._id}, {
        $set: {
          order,
          parentId,
          level
        }
      })
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