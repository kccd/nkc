const router = require('koa-router')();
const permissions = require("../../../../middlewares/permission");
router
  .post('/', permissions.OnlyUser(), async (ctx, next) => {
    //专栏主自己添加文章
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
    const order = await db.ColumnPostModel.getCategoriesOrder(mainCategoriesId);
    const columnPostTypes = await db.ColumnPostModel.getColumnPostTypes();
    const threadColumnPostArr = await db.ThreadModel.aggregate([
      {
        $match : {tid: {$in: threadsId}, uid: user.uid}
      },
      {
        $project: {
          toc: 1,
          oc: 1
        }
      },
      {
        $lookup:{
          from: 'columnPosts',
          let: { oc_pid: "$oc" },
          pipeline: [
            { $match:
                {
                  $expr:
                    { $and:
                        [
                          { $eq: [ "$pid",  "$$oc_pid" ] },
                          { $eq: [ "$columnId", column._id ] },
                          { $eq: [ "$type", columnPostTypes.thread ] },
                        ]
                    }
                }
            },
          ],
          as: "content"
        }
      },
    ]);
    const articleColumnPostArr = await db.ArticleModel.aggregate([
      {
        $match : {_id: {$in: articlesId}, uid: user.uid}
      },
      {
        $project: {
          toc: 1,
          _id: 1
        }
      },
      {
        $lookup:{
          from: 'columnPosts',
          let: { id_pid: "$_id" },
          pipeline: [
            { $match:
                {
                  $expr:
                    { $and:
                        [
                          { $eq: [ "$pid",  "$$id_pid" ] },
                          { $eq: [ "$columnId", column._id ] },
                          { $eq: [ "$type", columnPostTypes.article ] },
                        ]
                    }
                }
            },
          ],
          as: "content"
        }
      },
    ]);
    // 已存在的专栏引用，需更新
    const oldColumnPostIds = new Set();
    // 新的，保存
    const newColumnPost = [];
    for(const articleColumnPost of articleColumnPostArr){
      if(articleColumnPost.content.length > 0){
        oldColumnPostIds.add(articleColumnPost.content[0]._id)
      } else {
        newColumnPost.push({...articleColumnPost,type: 'article'})
      }
    }
    for(const threadColumnPost of threadColumnPostArr){
      if(threadColumnPost.content.length > 0){
        oldColumnPostIds.add(threadColumnPost.content[0]._id)
      } else {
        newColumnPost.push({...threadColumnPost,type: 'thread'})
      }
    }
    if(oldColumnPostIds.size > 0){
      await db.ColumnPostModel.updateMany({_id: {$in: [...oldColumnPostIds]}},{
        cid: mainCategoriesId,
        mcid: minorCategoriesId,
        order
      });
    }
    if(newColumnPost.length > 0){
      for(const columnPost of newColumnPost){
        await db.ColumnPostModel({
          _id: await db.SettingModel.operateSystemID("columnPosts", 1),
          tid: '',
          from: 'own',
          pid: columnPost.type==='thread'?columnPost.oc: columnPost._id,
          columnId: column._id,
          type: columnPost.type,
          order,
          top: columnPost.toc,
          cid: mainCategoriesId,
          mcid: minorCategoriesId,
        }).save();
      }
    }
    ctx.apiData = {};
    await next();
  });
module.exports = router;
