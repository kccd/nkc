const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    ctx.template = "column/column.pug";
    await next();
  })
  .post("/", async (ctx, next) => {
    const {data, db, body, nkcModules, tools} = ctx;
    const {contentLength} = tools.checkString;
    const {files, fields} = body;
    const {avatar, banner} = files;
    const {abbr, name, description} = fields;
    if(!avatar) ctx.throw(400, "专栏头像不能为空");
    if(!banner) ctx.throw(400, "专栏背景不能为空");
    if(!name) ctx.throw(400, "专栏名不能为空");
    if(contentLength(name) > 60) ctx.throw(400, "专栏名不能超过60字符");
    const sameName = await db.ColumnModel.findOne({nameLowerCase: name.toLocaleString()});
    if(sameName) ctx.throw(400, "专栏名已存在，请更换");
    if(!abbr) ctx.throw(400, "专栏名简介不能为空");
    if(contentLength(abbr) > 120) ctx.throw(400, "专栏简介不能超过120字符");
    if(!description) ctx.throw(400, "专栏介绍不能为空");
    if(contentLength(description) > 1000) ctx.throw(400, "专栏介绍不能超过1000字符");
    const column = db.ColumnModel({
      _id: await db.SettingModel.operateSystemID("columns", 1),
      uid: data.user.uid,
      name,
      nameLowerCase: name.toLocaleString(),
      abbr,
      description
    });
    const category = db.ColumnPostCategoryModel({
      columnId: column._id,
      name: "自定义分类",
      description: "专栏主自定义分类"
    });
    await nkcModules.file.saveColumnAvatar(column._id, avatar);
    await nkcModules.file.saveColumnBanner(column._id, banner);
    await column.save();
    await category.save();
    data.column = column;
    await next();
  })
  .get("/apply", async (ctx, next) => {
    ctx.template = "column/apply.pug";
    await next();
  });
module.exports = router;