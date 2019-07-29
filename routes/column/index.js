const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    if(!ctx.state.columnPermission) ctx.throw(403, "您的账号暂未满足开设专栏的条件");
    ctx.template = "column/column.pug";
    const {data, db} = ctx;
    const {user} = data;
    const column = await db.ColumnModel.findOne({uid: user.uid});
    if(column && !column.closed) {
      let url = `/m/${column._id}`;
      if(ctx.query.apptype === "app") {
        url += "?apptype=app"
      }
      return ctx.redirect(url);
    }
    await next();
  })
  .post("/", async (ctx, next) => {
    const {data, db, body, nkcModules, tools, state} = ctx;
    if(!state.columnPermission) ctx.throw(403, "您的账号暂未满足开设专栏的条件");
    const {contentLength} = tools.checkString;
    const {files, fields} = body;
    const {avatar, banner} = files;
    const {abbr, name, description} = fields;
    if(!avatar) ctx.throw(400, "专栏Logo不能为空");
    if(!banner) ctx.throw(400, "专栏Banner不能为空");
    if(!name) ctx.throw(400, "专栏名不能为空");
    if(contentLength(name) > 60) ctx.throw(400, "专栏名不能超过60字符");
    let sameName = await db.ColumnModel.findOne({nameLowerCase: name.toLowerCase()});
    if(sameName) ctx.throw(400, "专栏名已存在，请更换");
    sameName = await db.UserModel.findOne({uid: {$ne: data.user.uid},usernameLowerCase: name.toLowerCase()});
    if(sameName) ctx.throw(400, "专栏名与用户名冲突，请更换");
    if(!abbr) ctx.throw(400, "专栏名简介不能为空");
    if(contentLength(abbr) > 120) ctx.throw(400, "专栏简介不能超过120字符");
    const column = db.ColumnModel({
      _id: await db.SettingModel.operateSystemID("columns", 1),
      uid: data.user.uid,
      userLogs: [
        {
          uid: data.user.uid,
          time: new Date()
        }
      ],
      name,
      nameLowerCase: name.toLowerCase(),
      abbr,
      description
    });
    const category = db.ColumnPostCategoryModel({
      _id: await db.SettingModel.operateSystemID("columnPostCategories", 1),
      columnId: column._id,
      default: true,
      name: "默认分类",
      description: "默认分类"
    });
    await nkcModules.file.saveColumnAvatar(column._id, avatar);
    await nkcModules.file.saveColumnBanner(column._id, banner);
    await column.save();
    await category.save();
    data.column = column;
    await db.ColumnModel.toSearch(column._id);
    await next();
  })
  .get("/apply", async (ctx, next) => {
    if(!ctx.state.columnPermission) ctx.throw(403, "您的账号暂未满足开设专栏的条件");
    ctx.template = "column/apply.pug";
    const {data, db} = ctx;
    const {user} = data;
    const column = await db.ColumnModel.findOne({uid: user.uid});
    if(column) {
      let url = `/m/${column._id}`;
      if(ctx.query.apptype === "app") {
        url += "?apptype=app"
      }
      if(column.closed) {
        await column.update({closed: false});
      }
      return ctx.redirect(url);
    }
    await next();
  });
module.exports = router;