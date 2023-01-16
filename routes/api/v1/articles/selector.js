const permissions = require("../../../../middlewares/permission");
const router = require('koa-router')();
router
  .get('/', permissions.OnlyUser(), async (ctx, next) => {
    //获取当前登录用户的独立文章信息
    const { db, data, query, nkcModules } = ctx;
    const {user} = data;
    const {page, articleSource} = query;
    const articleSourceArr = JSON.parse(articleSource);
    const articleStatus = await db.ArticleModel.getArticleStatus();
    const match = {
      uid: user.uid,
      status: articleStatus.normal,
      source: {$in: articleSourceArr}
    };
    const count = await db.ArticleModel.countDocuments(match);
    const paging = await nkcModules.apiFunction.paging(page, count);
    const documentSources = await db.DocumentModel.getDocumentSources();
    const documentTypes = await db.DocumentModel.getDocumentTypes();
    const columnPostTypes = await db.ColumnPostModel.getColumnPostTypes();
    const articles = await db.ArticleModel.aggregate([
      {
        $match : match
      },
      {
        $sort:{toc:-1}
      },
      {
        $skip: paging.start
      },
      {
        $limit: paging.perpage
      },
      {
        $project: {
          did: 1,
          _id: 1,
          source: 1,
        }
      },
      {
        $lookup:{
          from: 'documents',
          let: { did: "$did" },
          pipeline: [
            { $match:
                { $expr:
                    { $and:
                        [
                          { $eq: [ "$did",  "$$did" ] },
                          { $eq: [ "$source", documentSources.article ] },
                          { $eq: [ "$type", documentTypes.stable ] },
                        ]
                    }

                }
            },
            { $project: {title: 1, content: 1, dt: 1 , _id: 0 } }
          ],
          as: "doc"
        }
      },

      {
        $lookup:{
          from: 'columnPosts',
          let: { id: "$_id" },
          pipeline: [
            { $match:
                { $expr:
                    { $and:
                        [
                          { $eq: [ "$pid",  "$$id" ] },
                          { $eq: [ "$type", columnPostTypes.article ] },
                        ]
                    }
                }
            },
            { $project: {columnId: 1, article:'$_id', _id: 0 } }
          ],
          as: "columnArticle"
        }
      },
      {
        $replaceRoot: { newRoot: { $mergeObjects: [ { $arrayElemAt: [ "$doc", 0 ] }, { $arrayElemAt: [ "$columnArticle", 0 ] }, "$$ROOT" ] } }
      },
      { $project: { doc: 0, columnArticle: 0, did: 0 } },
    ]);
    ctx.apiData = {
      articles: articles.map(item=>{
        let url;
        if(item.source === 'zone'){
          url = nkcModules.tools.getUrl('zoneArticle', item._id)
        }else {
          url = nkcModules.tools.getUrl('columnArticle', item.columnId, item.article)
        }
        return{
          tid: item._id,
          source: columnPostTypes.article,
          toc: item.dt,
          t: item.title,
          c: nkcModules.nkcRender.htmlToPlain(item.content,20),
          url
        }
      }),
      paging
    };
    await next();
  })
module.exports = router;
