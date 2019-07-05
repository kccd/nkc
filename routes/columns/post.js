const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {query, data, db, nkcModules} = ctx;
    const {page = 0, cid} = query;
    const {column, user} = data;
    if(column.uid !== user.uid) ctx.throw(403, "权限不足");
    const q = {
      columnId: column._id,
      cid
    };
    const count = await db.ColumnPostModel.count(q);
    const paging = nkcModules.apiFunction.paging(page, count);
    const sort = {};
    sort[`order.cid_${cid}`] = -1;
    const columnPosts = await db.ColumnPostModel.find(q).sort(sort).skip(paging.start).limit(paging.perpage);
    data.columnPosts = await db.ColumnPostModel.extendColumnPosts(columnPosts);
    data.paging = paging;
    await next();
  })
  .post("/", async (ctx, next) => {
    const {body, data, db} = ctx;
    const {postsId, categoriesId, type, categoryId} = body;
    const {column, user} = data;
    if(column.uid !== user.uid) ctx.throw(403, "权限不足");
    if(!postsId || postsId.length === 0) ctx.throw(400, "最少包含一条内容");
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
          await columnPost.update({
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
        await db.ColumnPostModel.remove({_id, columnId: column._id});
        await db.ColumnModel.update({_id: column._id}, {$pull: {topped: _id}});
      }
    } else if(type === "removeColumnPostByPid") { // 通过pid删除专栏内容
      for(const pid of postsId) {
        const post = await db.ColumnPostModel.findOne({columnId: column._id, pid});
        if(post) {
          await post.remove();
          await db.ColumnModel.update({_id: column._id}, {$pull: {topped: post._id}});
        }
      }
    } else if(type === "moveById") { // 更改专栏内容分类
      if(!categoriesId || categoriesId.length === 0) ctx.throw(400, "文章分类不能为空");
      for(const _id of categoriesId) {
        const c = await db.ColumnPostCategoryModel.findOne({_id, columnId: column._id});
        if(!c) ctx.throw(400, `ID为${_id}的分类不存在`);
      }
      for(const _id of postsId) {
        const columnPost = await db.ColumnPostModel.findOne({columnId: column._id, _id});
        if(!columnPost) continue;
        const {order} = columnPost;
        const newOrder = {};
        for(const cid of categoriesId) {
          let o = order[`cid_${cid}`];
          if(o === undefined) o = await db.SettingModel.operateSystemID("columnPostOrders", 1);
          newOrder[`cid_${cid}`] = o
        }
        await db.ColumnPostModel.updateOne({
          columnId: column._id,
          _id
        }, {
          $set: {
            cid: categoriesId,
            order: newOrder
          }
        });
      }
    } else if(type === "columnTop") {
      for(const _id of postsId) {
        const p = await db.ColumnPostModel.findOne({columnId: column._id, _id});
        if(!p) continue;
        if(!column.topped.includes(_id)) column.topped.unshift(_id);
      }

      await column.update({
        topped: column.topped
      });

      data.columnTopped = column.topped;

    } else if(type === "unColumnTop") {
      const arr = [];
      for(const _id of postsId) {
        const p = await db.ColumnPostModel.findOne({columnId: column._id, _id});
        if(!p) continue;
        arr.push(_id);
      }
      column.topped = column.topped.filter(_id => !arr.includes(_id));

      await column.update({
        topped: column.topped
      });

      data.columnTopped = column.topped;

    } else if([
      "categoryToTop", // 移动到顶部
      "categoryToBottom", // 移动到底部
    ].includes(type)) {
      const category = await db.ColumnPostCategoryModel.findOne({columnId: column._id, _id: categoryId});
      if(!category) ctx.throw(400, `文章分类ID错误 ID: ${categoryId}`);
      const arr = [];
      for(const _id of postsId) {
        const p = await db.ColumnPostModel.findOne({columnId: column._id, _id, cid: categoryId});
        if(!p) continue;
        arr.push(p);
      }
      if(type === "categoryToTop") {
        for(const p of arr) {
          const updateObj = {};
          updateObj[`order.cid_${categoryId}`] = await db.SettingModel.operateSystemID("columnPostOrders", 1);
          await p.update(updateObj);
        }
      } else if(type === "categoryToBottom") {
        for(const p of arr) {
          const updateObj = {};
          updateObj[`order.cid_${categoryId}`] = await db.SettingModel.operateSystemID("columnPostDownOrders", -1);
          await p.update(updateObj);
        }
      }
    } else if(["categoryUp", "categoryDown"].includes(type) ) {
      const category = await db.ColumnPostCategoryModel.findOne({columnId: column._id, _id: categoryId});
      if(!category) ctx.throw(400, `文章分类ID错误 ID: ${categoryId}`);
      const columnPost = await db.ColumnPostModel.findOne({columnId: column._id, _id: postsId, cid: categoryId});
      if(!columnPost) ctx.throw(400, `找不到ID为${postsId}的专栏文章记录`);
      const match = {
        columnId: column._id,
        cid: categoryId
      };
      const sort = {};
      if(type === "categoryUp") {
        match[`order.cid_${categoryId}`] = {$gt: columnPost.order[`cid_${categoryId}`] || 0};
        sort[`order.cid_${categoryId}`] = 1;
      } else {
        match[`order.cid_${categoryId}`] = {$lt: columnPost.order[`cid_${categoryId}`] || 0};
        sort[`order.cid_${categoryId}`] = -1;
      }
      const columnPost_ = await db.ColumnPostModel.findOne(match).sort(sort);
      if(columnPost_) {
        const newOrder = columnPost_.order[`cid_${categoryId}`];
        const oldOrder = columnPost.order[`cid_${categoryId}`] || 0;

        let updateObj = {};
        updateObj[`order.cid_${categoryId}`] = newOrder;
        await columnPost.update(updateObj);
        updateObj = {};
        updateObj[`order.cid_${categoryId}`] = oldOrder;
        await columnPost_.update(updateObj);
      }
    } else if(["categoryTop", "unCategoryTop"].includes(type)) {
      const category = await db.ColumnPostCategoryModel.findOne({columnId: column._id, _id: categoryId});
      if(!category) ctx.throw(400, `文章分类ID错误 ID: ${categoryId}`);
      const columnPost = await db.ColumnPostModel.findOne({columnId: column._id, _id: postsId, cid: categoryId});
      if(!columnPost) ctx.throw(400, `找不到ID为${postsId}的专栏文章记录`);
      if(type === "categoryTop") {
        await category.update({
          $addToSet: {
            topped: columnPost._id
          }
        });
      } else {
        await category.update({
          $pull: {
            topped: columnPost._id
          }
        });
      }
      data.categoryTopped = (await db.ColumnPostCategoryModel.findOne({_id: categoryId})).topped;
    }
    await next();
  });

module.exports = router;