const router = require('koa-router')();
const {
  OnlyUnbannedUser,
  Public,
} = require('../../../../middlewares/permission');
const articlesRouter = require('./articles');

router
  .use('/:_id', Public(), async (ctx, next) => {
    const { db, params, data } = ctx;
    const { _id } = params;
    data.column = await db.ColumnModel.findById(_id);
    await next();
  })
  .get('/:_id', Public(), async (ctx, next) => {
    const { data, db, query, nkcModules, params } = ctx;
    const { _id } = params;
    const column = await db.ColumnModel.findById(_id);
    if (!column) {
      ctx.throw(404, `未找到ID为${_id}的专栏`);
    }
    const { user } = data;
    //获取当前用户是否能查看所有状态的文章
    data.isModerator =
      ctx.permissionsOr(['review', 'movePostsToDraft', 'movePostsToRecycle']) ||
      (user && user.uid === column.uid);
    if (!ctx.permission('column_single_disabled')) {
      if (column.disabled) {
        nkcModules.throwError(403, '专栏已屏蔽', 'columnHasBeenBanned');
      }
      if (column.closed) {
        nkcModules.throwError(403, '专栏已关闭', 'columnHasBeenClosed');
      }
    }
    data.column = column;
    const timeout = 24 * 60 * 60 * 1000;
    if (
      !column.refreshTime ||
      Date.now() - new Date(column.refreshTime).getTime() > timeout
    ) {
      await column.updateBasicInfo();
    }
    const { isModerator } = data;
    let { page = 0, c: categoriesIdString = '' } = query;
    page = Number(page);
    const categoriesId = categoriesIdString.split('-');
    let cid = categoriesId[0];
    let mcid = categoriesId[1];
    if (cid) {
      cid = parseInt(cid);
    }
    if (mcid) {
      mcid = parseInt(mcid);
    }
    data.column = await column.extendColumn();
    const q = {
      columnId: column._id,
    };
    //当前用户能查看的文章
    const fidOfCanGetThread = await db.ForumModel.getReadableForumsIdByUid(
      data.user ? data.user.uid : '',
    );
    const sort = {};
    if (cid) {
      //主分类
      const category = await db.ColumnPostCategoryModel.findOnly({ _id: cid });
      if (category.columnId !== column._id) {
        ctx.throw(400, `文章分类【${cid}】不存在或已被专栏主删除`);
      }
      data.category = category;
      const childCategoryId =
        await db.ColumnPostCategoryModel.getChildCategoryId(cid);
      childCategoryId.push(cid);
      let minorCategory;
      if (mcid) {
        minorCategory = await db.ColumnPostCategoryModel.findOne({ _id: mcid });
        sort[`order.cid_${category._id}_${mcid}`] = -1;
      } else {
        sort[`order.cid_${category._id}_default`] = -1;
      }
      if (minorCategory) {
        q.mcid = minorCategory._id;
        data.minorCategory = minorCategory;
        await data.minorCategory.renderDescription();
      }
      q.cid = { $in: childCategoryId };
      data.topped = await db.ColumnPostModel.getToppedColumnPosts({
        columnId: column._id,
        fidOfCanGetThread,
        cid,
        isModerator,
      });
      data.toppedId = data.category.topped;
    } else {
      data.topped = await db.ColumnPostModel.getToppedColumnPosts({
        columnId: column._id,
        fidOfCanGetThread,
        isModerator,
      });
      data.toppedId = data.column.topped;
      if (mcid) {
        sort[`order.cid_default_${mcid}`] = -1;
      } else {
        sort[`order.cid_default_default`] = -1;
      }
    }
    const count = await db.ColumnPostModel.countDocuments(q);
    const paging = nkcModules.apiFunction.paging(page, count, column.perpage);
    const columnPosts = await db.ColumnPostModel.find(q)
      .sort(sort)
      .skip(paging.start)
      .limit(paging.perpage);

    data.paging = paging;
    //获取专栏文章
    data.columnPosts = await db.ColumnPostModel.extendColumnPosts({
      columnPosts,
      fidOfCanGetThread,
      isModerator,
    });
    ctx.apiData = {
      column: data.column,
      columnPosts: data.columnPosts,
      category: data.category,
      topped: data.topped,
      paging: data.paging,
      toppedId: data.toppedId,
    };
    await next();
  })
  .use(
    '/:_id/articles',
    articlesRouter.routes(),
    articlesRouter.allowedMethods(),
  );
module.exports = router;
