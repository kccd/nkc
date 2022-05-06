const router = require('koa-router')();
router
  .post('/', async (ctx, next) => {
    //收藏独立文章
    const {db, data, params,body, state} = ctx;
    const {aid} = params;
    const {type, cid = []} = body;
    const {user} = data;
    const article = await db.ArticleModel.findOnly({_id: aid});
    if(!article) ctx.throw(404, '未找到文章，请刷新后重试');
    const {disabled}= await db.ArticleModel.getArticleStatus();
    if(article.status === disabled) ctx.throw(400, '不能收藏已被封禁的文章');
    let collection = await db.SubscribeModel.findOne({cancel: false, tid: aid, uid: user.uid, type: 'article'});
    if(type) {
     if(collection) ctx.throw(400, '文章已收藏，请勿重复提交');
      for(const typeId of cid) {
        const subType = await db.SubscribeTypeModel.findOne({_id: typeId, uid: user.uid});
        if(!subType) ctx.throw(400, `未找到ID为${typeId}的关注分类`);
      }
      collection = db.SubscribeModel({
        _id: await db.SettingModel.operateSystemID("subscribes", 1),
        uid: user.uid,
        tid: aid,
        cid,
        type: "article"
      });
      await collection.save();
      await db.SubscribeTypeModel.updateCount(cid);
    } else {
        if(!collection) ctx.throw(400, '文件未在收藏夹中，请刷新');
        const {cid} = collection;
        await collection.cancelSubscribe();
        await db.SubscribeTypeModel.updateCount(cid);
    }
    await db.SubscribeModel.saveUserCollectionThreadsId(user.uid);
    data.targetUser = (await db.ArticleModel.getArticlesInfo([article]))[0].user;
    await next();
  })
module.exports = router;
