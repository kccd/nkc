const Router = require("koa-router");
const router = new Router();
router
  .use('/', async (ctx, next) => {
    const { db } = ctx;
    const { user, column } = ctx.data;
    const userPermissionObject = await db.ColumnModel.getUsersPermissionKeyObject();
    const isPermission = await db.ColumnModel.checkUsersPermission(column.users,user.uid,userPermissionObject.column_settings_contribute)
    if (!isPermission && column.uid !== user.uid) {
      ctx.throw(403, '权限不足');
    }
    await next();
  })
  .get("/", async (ctx, next) => {
    const {data, db, query, nkcModules} = ctx;
    const {page=0, t} = query;
    const {column} = data;
    let q;
    data.mainCategories = await db.ColumnPostCategoryModel.getCategoryList(column._id);
    data.minorCategories = await db.ColumnPostCategoryModel.getMinorCategories(column._id);
    data.nav = "contribute";
    if(t === 'unresolved') {
      q = {
        columnId: column._id,
        passed: null
      };
    } else if(t === 'resolved') {
      q = {
        columnId: column._id,
        passed: {$ne: null}
      }
    } else {
      ctx.template = 'columns/settings/contribute.pug';
      return await next();
    }
    const count = await db.ColumnContributeModel.countDocuments(q);
    const paging = nkcModules.apiFunction.paging(page, count);
    const contributes = await db.ColumnContributeModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    data.contributes = await db.ColumnContributeModel.extendColumnContributes(contributes);
    data.resolvedCount = await db.ColumnContributeModel.countDocuments({columnId: column._id, passed: {$ne: null}});
    data.unresolvedCount = await db.ColumnContributeModel.countDocuments({columnId: column._id, passed: null});
    data.paging = paging;
    data.t = t;
    await next();
  })
  .post("/", async (ctx, next) => {
    const {data, db, body} = ctx;
    const {contributes, type, reason, mainCategoriesId, minorCategoriesId} = body;
    const {column} = data;
    if(!mainCategoriesId || mainCategoriesId.length === 0) {
      if(type === "agree") ctx.throw(400, "请选择文章分类");
    }
    for(const _id of mainCategoriesId.concat(minorCategoriesId)) {
      const c = await db.ColumnPostCategoryModel.findOne({_id, columnId: column._id});
      if(!c) ctx.throw(400, `ID为${_id}的分类不存在`);
    }
    for(const _contribute of contributes) {
      const contribute = await db.ColumnContributeModel.findOne({_id: _contribute._id, columnId: column._id});
      if(!contribute || contribute.passed !== null) continue;
      let thread;
      if(_contribute.source === 'thread'){
        thread = await db.ThreadModel.findOne({tid: contribute.tid});
      }else if(_contribute.source === 'article'){
        thread = await db.ArticleModel.findOne({_id: contribute.tid});
      }
      if(!thread) continue;
      await contribute.updateOne({
        tlm: Date.now(),
        reason,
        passed: type === "agree"
      });
      if(type === "agree") {
        let p;
        if(_contribute.source === 'thread'){
          p = await db.ColumnPostModel.findOne({columnId: column._id, pid: thread.oc, type: _contribute.source});
        }else if(_contribute.source === 'article'){
          p = await db.ColumnPostModel.findOne({columnId: column._id, pid: thread._id, type: _contribute.source});
        }
        if(p) continue;
        // const categoriesOrder = await db.ColumnPostModel.getCategoriesOrder(mainCategoriesId);
        await db.ColumnPostModel({
          _id: await db.SettingModel.operateSystemID("columnPosts", 1),
          tid: '',
          from: "contribute",
          pid: _contribute.source === 'thread' ? thread.oc : thread._id,
          columnId: column._id,
          type: _contribute.source,
          order: await db.ColumnPostModel.getColumnPostOrder(mainCategoriesId,minorCategoriesId),
          top: thread.toc,
          cid: mainCategoriesId,
          mcid: minorCategoriesId,
        }).save();
      }
      const message = db.MessageModel({
        _id: await db.SettingModel.operateSystemID("messages", 1),
        r: contribute.uid,
        ty: "STU",
        ip: ctx.address,
        port: ctx.port,
        c: {
          type: "columnContributeChange",
          columnId: column._id
        }
      });
      await message.save();
      await ctx.nkcModules.socket.sendMessageToUser(message._id);
    }
    await next();
  });
module.exports = router;
