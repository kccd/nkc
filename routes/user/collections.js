const Router = require('koa-router');
const collectionsRouter = new Router();
const nkcModules = require('../../nkcModules');
let dbFn = nkcModules.dbFunction;

collectionsRouter
  .get('/:category', async (ctx, next) => {
    const {db, data} = ctx;
    const {category} = ctx.params;
    const {user} = data;
    const {ThreadModel} = db;
    const targetUserUid = ctx.params.uid;
    let targetUser = {};
    if(user && user.uid === targetUserUid) {
      targetUser = user;
    }else {
      targetUser = await db.UserModel.findOnly({uid: targetUserUid});
    }

    data.forumList = await db.ForumModel.getAccessibleForums(data.userRoles, data.userGrade, data.user);
    data.targetUser = targetUser;
    let categoryNames = await db.CollectionModel.aggregate([
      {$match: {uid: targetUserUid}},
      {$sort: {toc: 1}},
      {$group: {_id: '$category', threadCount: {$sum: 1}}},
    ]);
    const categories = [];
    categoryNames = categoryNames.map(n => {
	    categories.push({
		    name: n._id,
		    threadCount: n.threadCount
	    });
      return (n._id? n._id: '未分类');
    });
    data.categories = categories;
    data.categoryNames = categoryNames;
    let queryDate = {
      uid: targetUserUid,
      category: category
    };
    let collectionCount = await db.CollectionModel.count(queryDate);
    if(collectionCount <= 0) queryDate.category = categoryNames[0];
    // 过滤掉有退回标记的帖子
    let categoryCollection1 = await db.CollectionModel.find(queryDate).sort({toc: -1});
    let categoryCollection = [];

    // const options = {
    //   gradeId,
    //   rolesId: [],
    //   uid: user?user.uid: ''
    // };
    for(const collection of categoryCollection1) {
      const thread = await ThreadModel.findOne({tid: collection.tid, recycleMark: {$ne: true}})
      if(thread){
        await thread.extendForum();
        try{
          await thread.ensurePermission(data.userRoles, data.userGrade, data.user)

          categoryCollection.push(collection)
        }catch(err){
  
        }
      }
    }
    // for(var i in categoryCollection1){
    //   var b = await ThreadModel.findOne({tid: categoryCollection1[i].tid,recycleMark: true})
    //   if(!b){
    //     categoryCollection.push(categoryCollection1[i])
    //   }
    // }

	  categoryCollection = await Promise.all(categoryCollection.map(async c => {
    	await c.extendThread().then(t => t.extendForum()).then(f => f.extendParentForum());
    	if(ctx.reqType === 'app') {
				let content = ctx.nkcModules.APP_nkc_render.experimental_render(c.thread.firstPost);
		    content = content.replace(/<.*?>/ig, '');
		    content = unescape(content.replace(/&#x/g,'%u').replace(/;/g,'').replace(/%uA0/g,' '));
		    content = content.slice(0, 300);
		    c.thread.firstPost.c = content;
	    }
    	return c.toObject();
    }));
    data.category = queryDate.category;
    data.categoryCollection = categoryCollection;
    ctx.template = 'interface_collections.pug';
    await next();
  })
  .patch('/:cid', async (ctx, next) => {
    const {db,data} = ctx;
    const {cid, category} = ctx.body;
    const obj = {};
    if(category) obj.category = category;
    const collection = await db.CollectionModel.findOne({cid: cid});
    if(data.user.uid !== collection.uid) ctx.throw(403,'抱歉，你没有资格修改别人的收藏');
    await collection.update(obj);
    await next();
  })
  .del('/:cid', async (ctx, next) => {
    const {db, data} = ctx;
    const {cid} = ctx.params;
    const collection = await db.CollectionModel.findOne({cid: cid});
    if(data.user.uid !== collection.uid) ctx.throw(403,'抱歉，你没有资格删除别人的收藏');
    await collection.remove();
    await next();
  });

module.exports = collectionsRouter;