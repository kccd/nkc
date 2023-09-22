const Router = require('koa-router');
const router = new Router();
const columnRouter = require('./column');
const homeArticle = require('./home/article');
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
    data.homePageTypes = { homePageTypes };
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

    if (data.t === homePageTypes.list) {
      return await homeList(ctx, next);
    } else if ([homePageTypes.new, homePageTypes.sub].includes(data.t)) {
      return await homeArticle(ctx, next);
    } else {
      ctx.throw(400, `Unknown type(t=${data.t})`);
    }
  })
  .use('/:_id', columnRouter.routes(), columnRouter.allowedMethods());
module.exports = router;
