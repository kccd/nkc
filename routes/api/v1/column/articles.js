const router = require('koa-router')();
router
  .post('/', async (ctx, next) => {
    const {body, data, db} = ctx;
    const {
      threadsId, articlesId, mainCategoriesId, minorCategoriesId,
    } = body;
    const {column, user} = data;
    if(column.uid !== user.uid) ctx.throw(403, "权限不足");
    if(threadsId.length === 0 && articlesId.length === 0) ctx.throw(400, "请选择文章");

    if(!mainCategoriesId || mainCategoriesId.length === 0) ctx.throw(400, "文章分类不能为空");
    for(const _id of mainCategoriesId.concat(minorCategoriesId)) {
      const c = await db.ColumnPostCategoryModel.findOne({_id, columnId: column._id});
      if(!c) ctx.throw(400, `ID为${_id}的分类不存在`);
    }
    for(const tid of threadsId) {
      const _thread = await db.ThreadModel.findOne({tid, uid: user.uid});
      let columnPost = await db.ColumnPostModel.findOne({columnId: column._id, pid: _thread.oc, type: 'thread'});
      const order = await db.ColumnPostModel.getCategoriesOrder(mainCategoriesId);
      if(columnPost) {
        await columnPost.updateOne({
          cid: mainCategoriesId,
          mcid: minorCategoriesId,
          order
        });
        continue;
      }
      await db.ColumnPostModel({
        _id: await db.SettingModel.operateSystemID("columnPosts", 1),
        tid: '',
        from: 'own',
        pid: _thread.oc,
        columnId: column._id,
        type: 'thread',
        order: order,
        top: _thread.toc,
        cid: mainCategoriesId,
        mcid: minorCategoriesId,
      }).save();
    }
    for(const articleId of articlesId) {
      const article = await db.ArticleModel.findOne({_id: articleId});
      let columnPost = await db.ColumnPostModel.findOne({columnId: column._id, pid: article._id, type: 'article'});
      const order = await db.ColumnPostModel.getCategoriesOrder(mainCategoriesId);
      if(columnPost) {
        await columnPost.updateOne({
          cid: mainCategoriesId,
          mcid: minorCategoriesId,
          order
        });
        continue;
      }
      await db.ColumnPostModel({
        _id: await db.SettingModel.operateSystemID("columnPosts", 1),
        tid: '',
        from: 'own',
        pid: article._id,
        columnId: column._id,
        type: 'article',
        order: order,
        top: article.toc,
        cid: mainCategoriesId,
        mcid: minorCategoriesId,
      }).save();
    }
    ctx.apiData = {};
    await next();
  });
module.exports = router;
