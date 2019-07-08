const Router = require("koa-router");
const router = new Router();
const categoryRouter = require("./category");
const settingsRouter = require("./settings");
const postRouter = require("./post");
const subscribeRouter = require("./subscribe");
const statusRouter = require("./status");
const contributeRouter = require("./contribute");
router
  .use("/", async (ctx, next) => {
    const {db, params, data} = ctx;
    const {_id} = params;
    const column = await db.ColumnModel.findById(_id);
    if(!column) ctx.throw(404, `未找到ID为${_id}的专栏`);
    if(column.closed) ctx.throw(400, "专栏已关闭");
    data.column = column;
    await next();
  })
  .get("/", async (ctx, next) => {
    const {data, db, query, nkcModules} = ctx;
    let {page = 0, c} = query;
    c = Number(c);
    ctx.template = "columns/column.pug";
    const {column, user} = data;
    data.column = await column.extendColumn();
    const q = {
      columnId: column._id
    };
    const fidOfCanGetThread = await db.ForumModel.getThreadForumsId(data.userRoles, data.userGrade, data.user);
    const sort = {};
    if(c) {
      const category = await db.ColumnPostCategoryModel.findById(c);
      if(category.columnId !== column._id) ctx.throw(400, `文章分类【${c}】不存在或已被专栏主删除`);
      data.category = category;
      data.categoriesNav = await db.ColumnPostCategoryModel.getCategoryNav(category._id);
      const childCategoryId = await db.ColumnPostCategoryModel.getChildCategoryId(c);
      childCategoryId.push(c);
      q.cid = {$in: childCategoryId};
      data.c = c;
      data.topped = await db.ColumnPostModel.getToppedColumnPosts(column._id, fidOfCanGetThread, c);
      data.toppedId = data.category.topped;
      sort[`order.cid_${category._id}`] = -1;
    } else {
      data.topped = await db.ColumnPostModel.getToppedColumnPosts(column._id, fidOfCanGetThread);
      data.toppedId = data.column.topped;
      sort[`order.cid_default`] = -1;
    }
    const count = await db.ColumnPostModel.count(q);
    const paging = nkcModules.apiFunction.paging(page, count);
    const columnPosts = await db.ColumnPostModel.find(q).sort(sort).skip(paging.start).limit(paging.perpage);
    data.paging = paging;
    data.columnPosts = await db.ColumnPostModel.extendColumnPosts(columnPosts, fidOfCanGetThread);
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
    data.categories = await db.ColumnPostCategoryModel.getCategoryList(column._id);
    data.columnPostcount = await db.ColumnPostModel.count({columnId: column._id});
    await next();
  })
  .patch("/", async (ctx, next) => {
    const {data, db, body, nkcModules, tools} = ctx;
    const {contentLength} = tools.checkString;
    const {column} = data;
    const {files, fields} = body;
    const type = body.type || fields.type;
    if(!type) {
      let {
        abbr, name, description, color, notice, links = [],
        otherLinks
      } = fields;
      const {avatar, banner} = files;
      if(!name) ctx.throw(400, "专栏名不能为空");
      if(contentLength(name) > 60) ctx.throw(400, "专栏名不能超过60字符");
      let sameName = await db.ColumnModel.findOne({_id: {$ne: column._id}, nameLowerCase: name.toLocaleString()});
      if(sameName) ctx.throw(400, "专栏名已存在，请更换");
      sameName = await db.UserModel.findOne({usernameLowerCase: name.toLocaleString()});
      if(sameName) ctx.throw(400, "专栏名与用户名冲突，请更换");
      if(!abbr) ctx.throw(400, "专栏名简介不能为空");
      if(contentLength(abbr) > 120) ctx.throw(400, "专栏简介不能超过120字符");
      // if(!description) ctx.throw(400, "专栏介绍不能为空");
      // if(contentLength(description) > 1000) ctx.throw(400, "专栏介绍不能超过1000字符");
      if(notice) {
        if(contentLength(notice) > 600) ctx.throw(400, "公告通知不能超过600字符");
        notice = notice.replace(/!\[.*?]\(.*?\)/ig, "");
        notice = notice.replace(/\[.*?]\(.*?\)/ig, "");
      }
      if(links) {
        links = JSON.parse(links);
        const links_ = [];
        for(const link of links) {
          const {name, url} = link;
          if(!name) ctx.throw(400, "自定义链接名不能为空");
          if(!url) ctx.throw(400, "自定义链接不能为空");
          if(contentLength(name) > 20) ctx.throw(400, "自定义链接名不能超过20字节");
          links_.push({
            name,
            url
          });
        }
        links = links_;
      }
      if(otherLinks) {
        otherLinks = JSON.parse(otherLinks);
        const otherLinks_ = [];
        for(const link of otherLinks) {
          const {name, url} = link;
          if(!name) ctx.throw(400, "友情链接名不能为空");
          if(!url) ctx.throw(400, "友情链接不能为空");
          if(contentLength(name) > 20) ctx.throw(400, "友情链接名不能超过20字节");
          otherLinks_.push({
            name,
            url
          });
        }
        otherLinks = otherLinks_;
      }
      await column.update({
        name,
        color,
        links,
        otherLinks,
        notice,
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
  .use("/status", statusRouter.routes(), statusRouter.allowedMethods())
  .use("/settings", settingsRouter.routes(), settingsRouter.allowedMethods());
module.exports = router;
