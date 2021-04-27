const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {query, data, db, nkcModules} = ctx;
    const {page = 0, cid, mcid} = query;
    const {column, user} = data;
    if(column.uid !== user.uid) ctx.throw(403, "权限不足");
    const q = {
      columnId: column._id
    };
    const sort = {};
    if(cid) {
      q.cid = cid;
      sort[`order.cid_${cid}`] = -1;
    } else {
      sort[`order.cid_default`] = -1;
    }
    if(mcid) {
      q.mcid = mcid;
    }
    const count = await db.ColumnPostModel.countDocuments(q);
    const paging = nkcModules.apiFunction.paging(page, count);
    const columnPosts = await db.ColumnPostModel.find(q).sort(sort).skip(paging.start).limit(paging.perpage);
    data.columnPosts = await db.ColumnPostModel.extendColumnPosts(columnPosts);
    const minorCategories = await db.ColumnPostCategoryModel.getMinorCategories(column._id);
    data.minorCategories = await db.ColumnPostCategoryModel.extendMinorCategoriesPostCount(minorCategories, cid || null);
    data.paging = paging;
    await next();
  })
  .post("/", async (ctx, next) => {
    const {body, data, db} = ctx;
    const {
      postsId, categoriesId, type, categoryId,
      mainCategoriesId, minorCategoriesId
    } = body;
    const {column, user} = data;
    if(column.uid !== user.uid) ctx.throw(403, "权限不足");
    if(!postsId || postsId.length === 0) {
      if(!["sortByPostTimeDES", "sortByPostTimeASC"].includes(type)) {
        ctx.throw(400, "最少包含一条内容");
      }
    }
    if(type === "addToColumn") { // 推送文章到专栏
      if(!categoriesId || categoriesId.length === 0) ctx.throw(400, "文章分类不能为空");
      for(const _id of categoriesId) {
        const c = await db.ColumnPostCategoryModel.findOne({_id, columnId: column._id});
        if(!c) ctx.throw(400, `ID为${_id}的分类不存在`);
      }
      for(const pid of postsId) {
        let columnPost = await db.ColumnPostModel.findOne({columnId: column._id, pid});
        const order = await db.ColumnPostModel.getCategoriesOrder(categoriesId);
        if(columnPost) {
          await columnPost.updateOne({
            cid: categoriesId,
            order
          });
          continue;
        }
        const post = await db.PostModel.findOne({pid, uid: column.uid});
        if(!post || post.uid !== user.uid) continue;
        const thread = await db.ThreadModel.findOne({tid: post.tid});
        columnPost = db.ColumnPostModel({
          _id: await db.SettingModel.operateSystemID("columnPosts", 1),
          tid: thread.tid,
          top: post.toc,
          order,
          pid,
          type: thread.oc === pid? "thread": "post",
          columnId: column._id,
          cid: categoriesId
        });
        await columnPost.save();
      }
    } else if(type === "removeColumnPostById") { // 通过ID删除专栏内容
      for(const _id of postsId) {
        const columnPost = await db.ColumnPostModel.findOne({_id, columnId: column._id});
        if(columnPost) {
          await columnPost.deleteOne();
        }
        await db.ColumnModel.updateOne({_id: column._id}, {$pull: {topped: _id}});
      }
      await db.ColumnPostCategoryModel.removeToppedThreads(column._id);
    } else if(type === "removeColumnPostByPid") { // 通过pid删除专栏内容
      for(const pid of postsId) {
        const post = await db.ColumnPostModel.findOne({columnId: column._id, pid});
        if(post) {
          await post.deleteOne();
          await db.ColumnModel.updateOne({_id: column._id}, {$pull: {topped: post._id}});
        }
      }
      await db.ColumnPostCategoryModel.removeToppedThreads(column._id);
    } else if(type === "moveById") { // 更改专栏内容分类
      if(!mainCategoriesId || mainCategoriesId.length === 0) ctx.throw(400, "文章分类不能为空");
      for(const _id of mainCategoriesId.concat(minorCategoriesId)) {
        const c = await db.ColumnPostCategoryModel.findOne({_id, columnId: column._id});
        if(!c) ctx.throw(400, `ID为${_id}的分类不存在`);
      }
      for(const _id of postsId) {
        const columnPost = await db.ColumnPostModel.findOne({columnId: column._id, _id});
        if(!columnPost) continue;
        const {order} = columnPost;
        const newOrder = {};
        for(const cid of mainCategoriesId) {
          let o = order[`cid_${cid}`];
          if(o === undefined) o = await db.SettingModel.operateSystemID("columnPostOrders", 1);
          newOrder[`cid_${cid}`] = o
        }
        await db.ColumnPostModel.updateOne({
          columnId: column._id,
          _id
        }, {
          $set: {
            cid: mainCategoriesId,
            mcid: minorCategoriesId,
            order: newOrder
          }
        });
      }
      await db.ColumnPostCategoryModel.removeToppedThreads(column._id);
    } else if(type === "columnTop") { // 专栏置顶
      for(const _id of postsId) {
        const p = await db.ColumnPostModel.findOne({columnId: column._id, _id});
        if(!p) continue;
        if(!column.topped.includes(_id)) column.topped.unshift(_id);
      }

      await column.updateOne({
        topped: column.topped
      });

      data.columnTopped = column.topped;

    } else if(type === "unColumnTop") { // 取消专栏置顶
      const arr = [];
      for(const _id of postsId) {
        const p = await db.ColumnPostModel.findOne({columnId: column._id, _id});
        if(!p) continue;
        arr.push(_id);
      }
      column.topped = column.topped.filter(_id => !arr.includes(_id));

      await column.updateOne({
        topped: column.topped
      });

      data.columnTopped = column.topped;

    } else if([
      "categoryToTop", // 移动到顶部
      "categoryToBottom", // 移动到底部
    ].includes(type)) {
      let keyName = ``;
      if(!categoryId) {
        keyName = "order.cid_default";
      } else {
        const category = await db.ColumnPostCategoryModel.findOne({columnId: column._id, _id: categoryId});
        if(!category) ctx.throw(400, `文章分类ID错误 ID: ${categoryId}`);
        keyName = `order.cid_${categoryId}`;
      }
      const arr = [];
      for(const _id of postsId) {
        const p = await db.ColumnPostModel.findOne({columnId: column._id, _id});
        if(!p) continue;
        arr.push(p);
      }
      if(type === "categoryToTop") {
        for(const p of arr) {
          const updateObj = {};
          updateObj[keyName] = await db.SettingModel.operateSystemID("columnPostOrders", 1);
          await p.updateOne(updateObj);
        }
      } else if(type === "categoryToBottom") {
        for(const p of arr) {
          const updateObj = {};
          updateObj[keyName] = await db.SettingModel.operateSystemID("columnPostDownOrders", -1);
          await p.updateOne(updateObj);
        }
      }
    } else if(["categoryUp", "categoryDown"].includes(type) ) { // 上移、下移
      let keyName = "", orderKeyName = "";
      if(categoryId) {
        const category = await db.ColumnPostCategoryModel.findOne({columnId: column._id, _id: categoryId});
        if(!category) ctx.throw(400, `文章分类ID错误 ID: ${categoryId}`);
        keyName = `order.cid_${categoryId}`;
        orderKeyName = `cid_${categoryId}`;
      } else {
        keyName = "order.cid_default";
        orderKeyName = `cid_default`

      }
      const columnPost = await db.ColumnPostModel.findOne({columnId: column._id, _id: postsId});
      if(!columnPost) ctx.throw(400, `找不到ID为${postsId}的专栏文章记录`);
      const match = {
        columnId: column._id
      };
      const sort = {};
      if(type === "categoryUp") {
        match[keyName] = {$gt: columnPost.order[orderKeyName] || 0};
        sort[keyName] = 1;
      } else {
        match[keyName] = {$lt: columnPost.order[orderKeyName] || 0};
        sort[keyName] = -1;
      }
      const columnPost_ = await db.ColumnPostModel.findOne(match).sort(sort);
      if(columnPost_) {
        const newOrder = columnPost_.order[orderKeyName];
        const oldOrder = columnPost.order[orderKeyName] || 0;

        let updateObj = {};
        updateObj[keyName] = newOrder;
        await columnPost.updateOne(updateObj);
        updateObj = {};
        updateObj[keyName] = oldOrder;
        await columnPost_.updateOne(updateObj);
      }
    } else if(["categoryTop", "unCategoryTop"].includes(type)) { // 专栏置顶、取消专栏置顶
      const category = await db.ColumnPostCategoryModel.findOne({columnId: column._id, _id: categoryId});
      if(!category) ctx.throw(400, `文章分类ID错误 ID: ${categoryId}`);
      const columnPost = await db.ColumnPostModel.findOne({columnId: column._id, _id: postsId, cid: categoryId});
      if(!columnPost) ctx.throw(400, `找不到ID为${postsId}的专栏文章记录`);
      if(type === "categoryTop") {
        await category.updateOne({
          $addToSet: {
            topped: columnPost._id
          }
        });
      } else {
        await category.updateOne({
          $pull: {
            topped: columnPost._id
          }
        });
      }
      data.categoryTopped = (await db.ColumnPostCategoryModel.findOne({_id: categoryId})).topped;
    } else if(["sortByPostTimeDES", "sortByPostTimeASC"].includes(type)) {
      let keyName = "";
      const match = {
        columnId: column._id
      };
      if(!categoryId) {
        keyName = "order.cid_default";
      } else {
        const category = await db.ColumnPostCategoryModel.findOne({columnId: column._id, _id: categoryId});
        if(!category) ctx.throw(400, `文章分类ID错误 ID: ${categoryId}`);
        keyName = `order.cid_${categoryId}`;
        match.cid = categoryId;
      }
      const sort = {
        toc: -1
      };
      if(type === "sortByPostTimeDES") {
        sort.toc = 1
      }

      const columnPosts = await db.ColumnPostModel.find(match);
      const pid = columnPosts.map(post => post.pid);
      const posts = await db.PostModel.find({pid: {$in: pid}}).sort(sort);
      for(const post of posts) {
        const obj = {};
        obj[keyName] = await db.SettingModel.operateSystemID("columnPostOrders", 1);
        await db.ColumnPostModel.updateOne({
          columnId: column._id,
          pid: post.pid
        }, {
          $set: obj
        });
      }
    }
    await next();
  });

module.exports = router;