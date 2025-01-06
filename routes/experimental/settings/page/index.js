const Router = require('koa-router');
const router = new Router();
const {
  articlePanelStyleTypes,
  articlePanelCoverTypes,
} = require('../../../../settings/articlePanel');
const { OnlyOperation } = require('../../../../middlewares/permission');
const { Operations } = require('../../../../settings/operations');
router
  .get('/', OnlyOperation(Operations.visitPageSettings), async (ctx, next) => {
    const { data, db } = ctx;
    data.pageSettings = await db.SettingModel.getSettings('page');
    data.articlePanelStyleTypes = { ...articlePanelStyleTypes };
    data.articlePanelCoverTypes = { ...articlePanelCoverTypes };
    ctx.template = 'experimental/settings/page/page.pug';
    await next();
  })
  .put('/', OnlyOperation(Operations.modifyPageSettings), async (ctx, next) => {
    const { db, body } = ctx;
    const { pageSettings } = body;
    let {
      homeThreadList,
      searchPostList,
      searchAllList,
      userCardThreadList,
      threadPostList,
      forumThreadList,
      userCardUserList,
      forumUserList,
      searchThreadList,
      searchUserList,
      threadPostCommentList,
      searchColumnList,
      searchResourceList,
      threadListStyle,
      articlePanelStyle,
    } = pageSettings;
    threadPostCommentList = parseInt(threadPostCommentList);
    homeThreadList = parseInt(homeThreadList);
    searchPostList = parseInt(searchPostList);
    searchAllList = parseInt(searchAllList);
    searchThreadList = parseInt(searchThreadList);
    searchUserList = parseInt(searchUserList);
    threadPostList = parseInt(threadPostList);
    userCardUserList = parseInt(userCardUserList);
    userCardThreadList = parseInt(userCardThreadList);
    forumThreadList = parseInt(forumThreadList);
    forumUserList = parseInt(forumUserList);
    searchColumnList = parseInt(searchColumnList);
    searchResourceList = parseInt(searchResourceList);
    const articlePanelStyleTypesArr = Object.values(articlePanelStyleTypes);
    const articlePanelCoverTypesArr = Object.values(articlePanelCoverTypes);
    if (!articlePanelStyleTypesArr.includes(threadListStyle.type)) {
      ctx.throw(400, `文章列表显示模式错误 type: ${threadListStyle.type}`);
    }
    if (!articlePanelCoverTypesArr.includes(threadListStyle.cover)) {
      ctx.throw(400, `文章列表封面图错误 cover: ${threadListStyle.cover}`);
    }
    const keys = Object.keys(articlePanelStyle);
    for (const i of keys) {
      const item = articlePanelStyle[i];
      if (!articlePanelStyleTypesArr.includes(threadListStyle.type)) {
        ctx.throw(400, `文章列表显示模式错误 type: ${item.type}`);
      }
      if (!articlePanelCoverTypesArr.includes(threadListStyle.cover)) {
        ctx.throw(400, `文章列表封面图错误 cover: ${item.cover}`);
      }
    }
    await db.SettingModel.updateOne(
      { _id: 'page' },
      {
        c: {
          homeThreadList,
          userCardThreadList,
          userCardUserList,
          threadPostCommentList,
          searchThreadList,
          searchPostList,
          searchResourceList,
          searchAllList,
          searchUserList,
          forumThreadList,
          forumUserList,
          threadPostList,
          searchColumnList,
          threadListStyle,
          articlePanelStyle,
        },
      },
    );
    await db.SettingModel.saveSettingsToRedis('page');
    await next();
  });
module.exports = router;
