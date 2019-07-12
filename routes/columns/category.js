const Router = require("koa-router");
const router = new Router();
router
  // 查看全部分类
  .get("/", async (ctx, next) => {
    const {data, db, query} = ctx;
    const {column} = data;
    const {t} = query;
    if(t === "list") {
      data.categories = await db.ColumnPostCategoryModel.getCategoryList(column._id);
      data.count = await db.ColumnPostModel.count({columnId: column._id});
    } else {
      const categories = await db.ColumnPostCategoryModel.find({columnId: column._id}).sort({toc: 1});
      data.categories = await db.ColumnPostCategoryModel.extendCategories(categories);
    }
    await next();
  })
  .post("/", async (ctx, next) => {
    const {tools, data, db, body} = ctx;
    const {column, user} = data;
    if(column.uid !== user.uid) ctx.throw(403, "权限不足");
    const {contentLength} = tools.checkString;
    const {name, description, parentId} = body;
    if(!name) ctx.throw(400, "分类名不能为空");
    if(contentLength(name) > 20) ctx.throw(400, "分类名不能超过20字符");
    if(!description) ctx.throw(400, "分类简介不能为空");
    if(contentLength(description) > 100) ctx.throw(400, "分类简介不能超过100字符");
    const sameName = await db.ColumnPostCategoryModel.findOne({columnId: column._id, name});
    if(sameName) ctx.throw(400, "分类名已存在");
    if(parentId) {
      const parentCategory = await db.ColumnPostCategoryModel.findOne({columnId: column._id, _id: parentId});
      if(!parentCategory) ctx.throw(400, "父分类设置错误，请刷新");
    }
    const category = db.ColumnPostCategoryModel({
      _id: await db.SettingModel.operateSystemID("columnPostCategories", 1),
      name,
      description,
      parentId,
      columnId: column._id
    });
    await category.save();
    data.category = category;
    await db.ColumnPostCategoryModel.computeCategoryOrder(column._id);
    await next();
  })
  .patch("/", async (ctx, next) => {
    const {db, data, body} = ctx;
    const {column, user} = data;
    if(column.uid !== user.uid) ctx.throw(403, "权限不足");
    const {categoriesId} = body;
    for(let i = 0; i < categoriesId.length; i++) {
      const category = await db.ColumnPostCategoryModel.findOne({columnId: column._id, _id: categoriesId[i]});
      if(category) {
        await category.update({order: i+1});
      }
    }
    await next();
  })
  .patch("/:categoryId", async (ctx, next) => {
    const {tools, data, db, body} = ctx;
    const {categoryId} = ctx.params;
    const {column, user} = data;
    if(column.uid !== user.uid) ctx.throw(403, "权限不足");
    const category = await db.ColumnPostCategoryModel.findOne({_id: categoryId});
    if(!category) ctx.throw(400, "分类不存在");
    const {contentLength} = tools.checkString;
    const {name, description, parentId} = body;
    if(!name) ctx.throw(400, "分类名不能为空");
    if(contentLength(name) > 20) ctx.throw(400, "分类名不能超过20字符");
    if(!description) ctx.throw(400, "分类简介不能为空");
    if(contentLength(description) > 100) ctx.throw(400, "分类简介不能超过100字符");
    const sameName = await db.ColumnPostCategoryModel.findOne({columnId: column._id, name, _id: {$ne: categoryId}});
    if(sameName) ctx.throw(400, "分类名已存在");
    if(parentId) {
      const parentCategory = await db.ColumnPostCategoryModel.findOne({columnId: column._id, _id: parentId});
      if(!parentCategory) ctx.throw(400, "父分类设置错误，请刷新");
    }
    await category.update({
      name,
      parentId,
      description
    });
    await db.ColumnPostCategoryModel.computeCategoryOrder(column._id);
    await next();
  })
  // 删除分类
  .del("/:categoryId", async (ctx, next) => {
    const {data, db} = ctx;
    const {column, user} = data;
    if(column.uid !== user.uid) ctx.throw(403, "权限不足");
    const {categoryId} = ctx.params;
    const category = await db.ColumnPostCategoryModel.findById(categoryId);
    if(!category) ctx.throw(400, "分类不存在");
    if(category.default) ctx.throw(400, "无法删除默认分类");
    const children = await db.ColumnPostCategoryModel.count({
      columnId: column._id,
      parentId: categoryId
    });
    if(children > 0) ctx.throw(400, "该分类下还有其他分类，无法删除");
    const postCount = await db.ColumnPostModel.count({columnId: column._id, cid: categoryId});
    if(postCount > 0) ctx.throw(400, "该分类下存在内容，无法删除");
    await db.ColumnPostCategoryModel.remove({columnId: column._id, _id: category._id});
    await next();
  });
module.exports = router;