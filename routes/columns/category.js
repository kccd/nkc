const Router = require("koa-router");
const router = new Router();
router
  // 查看全部分类
  .get("/", async (ctx, next) => {
    const {data, db} = ctx;
    const {column} = data;
    const categories = await db.ColumnPostCategoryModel.find({columnId: column._id}).sort({toc: 1});
    data.categories = await db.ColumnPostCategoryModel.extendCategories(categories);
    await next();
  })
  .post("/", async (ctx, next) => {
    const {tools, data, db, body} = ctx;
    const {column, user} = data;
    if(column.uid !== user.uid) ctx.throw(403, "权限不足");
    const {contentLength} = tools.checkString;
    const {name, description} = body;
    if(!name) ctx.throw(400, "分类名不能为空");
    if(contentLength(name) > 50) ctx.throw(400, "分类名不能超过50字符");
    if(!description) ctx.throw(400, "分类简介不能为空");
    if(contentLength(description) > 100) ctx.throw(400, "分类简介不能超过100字符");
    const sameName = await db.ColumnPostCategoryModel.findOne({columnId: column._id, name});
    if(sameName) ctx.throw(400, "分类名已存在");
    const category = db.ColumnPostCategoryModel({
      _id: await db.SettingModel.operateSystemID("columnPostCategories", 1),
      name,
      description,
      columnId: column._id
    });
    await category.save();
    data.category = category;
    await next();
  })
  // 删除分类
  .del("/:categoryId", async (ctx, next) => {
    const {data, db} = ctx;
    const {column} = data;
    const {categoryId} = ctx.params;
    const category = await db.ColumnPostCategoryModel.findById(categoryId);
    if(!category) ctx.throw(400, "分类不存在");
    const postCount = await db.ColumnPostModel.count({columnId: column._id, cid: categoryId});
    if(postCount !== 0) ctx.throw(400, "该分类下存在内容，无法删除");
    await category.remove();
    await next();
  });
module.exports = router;