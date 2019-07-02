const Router = require("koa-router");
const router = new Router();
const categoryRouter = require("./category");
const settingsRouter = require("./settings");
const postRouter = require("./post");
const subscribeRouter = require("./subscribe");
const contributeRouter = require("./contribute");
router
  .use("/", async (ctx, next) => {
    const {db, params, data} = ctx;
    const {_id} = params;
    const column = await db.ColumnModel.findById(_id);
    if(!column) ctx.throw(404, `未找到ID为${_id}的专栏`);
    data.column = column;
    await next();
  })
  .get("/", async (ctx, next) => {
    const {data, db, query, nkcModules} = ctx;
    const {page = 0} = query;
    ctx.template = "columns/column.pug";
    const {column, user} = data;
    data.column = await column.extendColumn();
    const categories = await db.ColumnPostCategoryModel.find({columnId: column._id}).sort({toc: 1});
    data.categories = await db.ColumnPostCategoryModel.extendCategories(categories);
    const q = {
      columnId: column._id
    };
    const count = await db.ColumnPostModel.count(q);
    const paging = nkcModules.apiFunction.paging(page, count);
    const columnPosts = await db.ColumnPostModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    data.paging = paging;
    data.columnPosts = await db.ColumnPostModel.extendColumnPosts(columnPosts);
    if(user) {
      const sub = await db.SubscribeModel.findOne({uid: user.uid, type: "column", columnId: column._id});
      data.subscribedColumn = !!sub;
      // 专栏主
      if(column.uid === user.uid) {
        data.contributeCount = await db.ColumnContributeModel.count({
          columnId: column._id,
          passed: null
        });
      }
    }

    await next();
  })
  .patch("/", async (ctx, next) => {
    const {data, db, body, nkcModules, tools} = ctx;
    const {contentLength} = tools.checkString;
    const {column} = data;
    const {files, fields} = body;
    const type = body.type || fields.type;
    if(!type) {
      const {abbr, name, description, color} = fields;
      const {avatar, banner} = files;
      if(!name) ctx.throw(400, "专栏名不能为空");
      if(contentLength(name) > 60) ctx.throw(400, "专栏名不能超过60字符");
      const sameName = await db.ColumnModel.findOne({_id: {$ne: column._id}, nameLowerCase: name.toLocaleString()});
      if(sameName) ctx.throw(400, "专栏名已存在，请更换");
      if(!abbr) ctx.throw(400, "专栏名简介不能为空");
      if(contentLength(abbr) > 120) ctx.throw(400, "专栏简介不能超过120字符");
      if(!description) ctx.throw(400, "专栏介绍不能为空");
      if(contentLength(description) > 1000) ctx.throw(400, "专栏介绍不能超过1000字符");
      await column.update({
        name,
        color,
        nameLowerCase: name.toLocaleString(),
        description,
        abbr
      });
      if(avatar) {
        await nkcModules.file.saveColumnAvatar(column._id, avatar);
      }
      if(banner) {
        await nkcModules.file.saveColumnBanner(column._id, banner);
      }
    } else if(type === "color") {
      const {color} = body;
      await column.update({
        color
      });
    }
    await next();
  })
  .get("/banner", async (ctx, next) => {
    const {nkcModules, data, query} = ctx;
    const {t} = query;
    ctx.filePath = await nkcModules.file.getColumnBanner(data.column._id, t);
    ctx.type = "jpg";
    await next();
  })
  .get("/avatar", async (ctx, next) => {
    const {nkcModules, data, query} = ctx;
    const {t} = query;
    ctx.filePath = await nkcModules.file.getColumnAvatar(data.column._id, t);
    ctx.type = "jpg";
    await next();
  })
  .use("/category", categoryRouter.routes(), categoryRouter.allowedMethods())
  .use("/post", postRouter.routes(), postRouter.allowedMethods())
  .use("/subscribe", subscribeRouter.routes(), subscribeRouter.allowedMethods())
  .use("/contribute", contributeRouter.routes(), contributeRouter.allowedMethods())
  .use("/settings", settingsRouter.routes(), settingsRouter.allowedMethods());
module.exports = router;
