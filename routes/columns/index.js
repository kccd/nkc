const Router = require('koa-router');
const router = new Router();
const { getUrl } = require('../../nkcModules/tools');
const columnRouter = require('./column');
const homeNew = require('./home/new');
const homeSub = require('./home/sub');
const homeList = require('./home/list');
const {
  columnListService,
} = require('../../services/column/columnList.service');

const homePageTypes = {
  new: 'new',
  sub: 'sub',
  list: 'list',
};

const { OnlyUser } = require('../../middlewares/permission');

const onlyUserPermission = OnlyUser();

router
  .use('/', async (ctx, next) => {
    const { db, data, state } = ctx;
    await db.ColumnModel.checkAccessControlPermissionWithThrowError({
      uid: state.uid,
      rolesId: data.userRoles.map((r) => r._id),
      gradeId: state.uid ? data.userGrade._id : undefined,
      isApp: state.isApp,
    });
    data.navbar_highlight = 'columns';
    await next();
  })
  .get('/', async (ctx, next) => {
    const { data, query } = ctx;
    const { t = homePageTypes.new } = query;
    data.t = t;
    if (t === homePageTypes.sub) {
      await onlyUserPermission(ctx, next);
    } else {
      await next();
    }
  })
  .get('/', async (ctx, next) => {
    const { data, state, db } = ctx;
    data.column = null;
    if (state.uid) {
      const column = await db.UserModel.getUserColumn(state.uid);
      if (column) {
        data.column = await columnListService.extendColumnBaseInfo(column);
      }
    }
    data.homePageTypes = { ...homePageTypes };
    // 热门专栏
    const hotColumns = await columnListService.getHotColumns();
    data.hotColumns = await columnListService.extendColumnsBaseInfo(hotColumns);
    data.subColumnsId = await db.SubscribeModel.getUserSubColumnsId(state.uid);

    ctx.template = 'columns/home/home.pug';
    switch (data.t) {
      // 最新文章
      case homePageTypes.new: {
        return await homeNew(ctx, next);
      }
      // 我的关注
      case homePageTypes.sub: {
        return await homeSub(ctx, next);
      }
      // 专栏列表
      case homePageTypes.list: {
        return await homeList(ctx, next);
      }
      default: {
        ctx.throw(400, `Unknown type(t=${data.t})`);
      }
    }
  })
  .use('/:_id', columnRouter.routes(), columnRouter.allowedMethods());
module.exports = router;
