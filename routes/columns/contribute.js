const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {data, db} = ctx;
    const {column} = data;
    const columnSettings = await db.SettingModel.findById("column");
    data.columnSettings = columnSettings.c;
    data.mainCategories = await db.ColumnPostCategoryModel.getCategoryList(column._id);
    data.minorCategories = await db.ColumnPostCategoryModel.getMinorCategories(column._id);
    ctx.template = "columns/contribute/contribute.pug";
    await next();
  })
  .post("/", async (ctx, next) => {
    const {db, body, data} = ctx;
    const {user, column} = data;
    // if(user.uid === column.uid) ctx.throw(400, "自己的专栏无需投稿，可在文章页直接将文章推送到专栏");
    let {threadsId, articlesId, description, mainCategoriesId, minorCategoriesId} = body;
    if(threadsId.length === 0 && articlesId.length === 0) ctx.throw(400, "请选择需要投稿的文章");
    if(!mainCategoriesId || mainCategoriesId.length === 0) ctx.throw(400, "请选择文章分类");
    for(const _id of mainCategoriesId.concat(minorCategoriesId)) {
      const c = await db.ColumnPostCategoryModel.findOne({_id, columnId: column._id});
      if(!c) ctx.throw(400, `ID为${_id}的分类不存在`);
    }
    const columnPostTypes = await db.ColumnPostModel.getColumnPostTypes();
    let threadCount = 0;
    let threads = [];
    if(threadsId.length !== 0){
      const _threadsObj ={};
      const _threads = await db.ThreadModel.find({tid: {$in: threadsId}, uid: user.uid});
      let ocs;
      if(_threads.length > 0){
        ocs = _threads.map(item => {
          _threadsObj[item.oc] = item;
          return item.oc
        })
      }
      const pArr = await db.ColumnPostModel.find({
        columnId: column._id,
        pid: {$in: ocs},
        type: columnPostTypes.thread
      });
      if(pArr.length > 0){
        const pocs = pArr.map(item => {
          return item.pid
        })
        ocs = ocs.filter(item=>{
          return !pocs.includes(item)
        })
        // if(p) ctx.throw(400, `ID为${tid}的文章已经被加入到专栏了，请勿重复投稿`);
      }
      if(ocs && ocs.length > 0){
        let contributes = await db.ColumnContributeModel.find({
          columnId: column._id,
          pid: {$in: ocs},
          source: columnPostTypes.thread,
          // passed: null
          passed: 'pending',
        });
        if(contributes && contributes.length > 0){
          const contributesPids = contributes.map(item => {
            return item.pid
          })
          ocs = ocs.filter(item=>{
            return !contributesPids.includes(item)
          })
          // ctx.throw(400, `ID为${tid}的文章正在等待专栏主审核，请勿重复投稿`);
        }
      }
      if(ocs && ocs.length > 0){
        ocs.forEach(item=>{
          threads.push(_threadsObj[item])
        })
      }
    }
    let articles = [];
    if(articlesId.length !== 0){
      const _articlesObj ={};
      const _articles = await db.ArticleModel.find({_id: {$in: articlesId}, uid: user.uid});
      let ids;
      if(_articles && _articles.length > 0){
        ids = _articles.map(item => {
          _articlesObj[item._id] = item;
          return item._id
        })
      }
      const pArr = await db.ColumnPostModel.find({
        columnId: column._id,
        pid: {$in: ids},
        type: columnPostTypes.article
      });
      if(pArr && pArr.length > 0){
        const pids = pArr.map(item => {
          return item.pid
        })
        ids = ids.filter(item=>{
          return !pids.includes(item)
        })
      }
      if(ids && ids.length > 0){
        let contributes = await db.ColumnContributeModel.find({
          // columnId: column._id, pid: {$in: ids}, source: 'thread',passed: null
          columnId: column._id, tid: {$in: ids}, source: 'article',passed: 'pending'
        });
        if(contributes && contributes.length > 0){
          const contributesPids = contributes.map(item => {
            return item.tid
          })
          ids = ids.filter(item=>{
            return !contributesPids.includes(item)
          })
          // ctx.throw(400, `ID为${tid}的文章正在等待专栏主审核，请勿重复投稿`);
        }
      }
      if(ids && ids.length > 0){
        ids.forEach(item=>{
          articles.push(_articlesObj[item])
        })
      }
    }

    for(const _thread of threads) {
      const contribute = db.ColumnContributeModel({
        _id: await db.SettingModel.operateSystemID("columnContributes", 1),
        uid: user.uid,
        tid: _thread.tid,
        pid: '',
        cid: mainCategoriesId,
        mcid: minorCategoriesId,
        description,
        columnId: column._id,
        source: columnPostTypes.thread,
        passed: 'pending',
        type: 'submit',
      });
      await contribute.save();
      threadCount++;
    }
    for(const _article of articles) {
      const userPermissionObject =
        await db.ColumnModel.getUsersPermissionKeyObject();
      const isPermission = await db.ColumnModel.checkUsersPermission(
        column.users,
        user.uid,
        userPermissionObject.column_post_add,
      );
      let passed = 'pending';
      if(isPermission || column.uid === user.uid){
        passed = 'resolve';
        const article = await db.ArticleModel.findOne({_id:_article._id});
        let columnPost = await db.ColumnPostModel.findOne({
          pid: _article._id,
          columnId: column._id,
          type: 'article',
        });
        if (!columnPost) {
          await db.ColumnPostModel({
            _id: await db.SettingModel.operateSystemID("columnPosts", 1),
            tid: '',
            from: "contribute",
            pid: article._id,
            columnId: column._id,
            type: 'article',
            order: await db.ColumnPostModel.getColumnPostOrder(mainCategoriesId,minorCategoriesId),
            top: article.toc,
            cid: mainCategoriesId,
            mcid: minorCategoriesId,
          }).save();
        }
        if (article.source === 'column') {
          // 需要进行更新article中sid
          let sidArray = [];
          const columnPostArray = await db.ColumnPostModel.find({
            pid: article._id,
            type: 'article',
          });
          for (const columnPostItem of columnPostArray) {
            sidArray.push(columnPostItem.columnId);
          }
          sidArray = [...new Set(sidArray)];
          await article.updateOne({ $set: { sid: sidArray.join('-')}});
        }
      }
      const contribute = db.ColumnContributeModel({
        _id: await db.SettingModel.operateSystemID("columnContributes", 1),
        uid: user.uid,
        tid: _article._id,
        pid: '',
        cid: mainCategoriesId,
        mcid: minorCategoriesId,
        description,
        columnId: column._id,
        source: columnPostTypes.article,
        passed,
        type: 'submit',
      });
      await contribute.save();
      threadCount++;
    }
    if(threadCount > 0) {
      const message = db.MessageModel({
        _id: await db.SettingModel.operateSystemID("messages", 1),
        r: column.uid,
        ty: "STU",
        ip: ctx.address,
        port: ctx.port,
        c: {
          type: "newColumnContribute",
          columnId: column._id
        }
      });
      await message.save();
      await ctx.nkcModules.socket.sendMessageToUser(message._id);
    }
    await next();
  });
module.exports = router;
