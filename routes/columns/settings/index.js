const Router = require('koa-router');
const router = new Router();
const postRouter = require('./post');
const contributeRouter = require('./contribute');
const categoryRouter = require('./category');
const closeRouter = require('./close');
const transferRouter = require('./transfer');
const pageRouter = require('./page');
const fansRouter = require('./fans');
const {
  OnlyUnbannedUser,
  OnlyUser,
} = require('../../../middlewares/permission');
router
  .use(['/transfer', '/close'], OnlyUser(), async (ctx, next) => {
    const { user, column } = ctx.data;
    if (column.uid !== user.uid && !ctx.permission('column_single_disabled')) {
      ctx.throw(403, '权限不足');
    }
    await next();
  })
  .use(
    ['/post', '/contribute', '/category', '/page', '/fans'],
    OnlyUser(),
    async (ctx, next) => {
      const { user, column } = ctx.data;
      if (
        column.uid !== user.uid &&
        !ctx.permission('column_single_disabled') &&
        column.users.findIndex((item) => item.uid === user.uid) === -1
      ) {
        ctx.throw(403, '权限不足');
      }
      await next();
    },
  )
  .get('/', OnlyUser(), async (ctx, next) => {
    const { column, user } = ctx.data;
    if (column.uid !== user.uid && !ctx.permission('column_single_disabled')) {
      ctx.throw(403, '权限不足');
    }
    const tempUsers = await ctx.db.UserModel.find({
      uid: { $in: column.users.map((item) => item.uid) },
    });
    const users = [];
    for (const user of tempUsers) {
      users.push({
        ...JSON.parse(JSON.stringify(user)),
        permission: column.users.find((item) => item.uid === user.uid)
          .permission,
      });
    }
    column.users = users;
    const userPermissionObject = await ctx.db.ColumnModel.getUsersPermission();
    const tempUsersPermission = [];
    for (const key in userPermissionObject) {
      tempUsersPermission.push({ id: key, title: userPermissionObject[key] });
    }
    ctx.data.usersPermission = tempUsersPermission;
    ctx.template = 'columns/settings/info.pug';
    ctx.data.nav = 'settings';
    await next();
  })
  .use(
    '/contribute',
    contributeRouter.routes(),
    contributeRouter.allowedMethods(),
  )
  .use('/category', categoryRouter.routes(), categoryRouter.allowedMethods())
  .use('/transfer', transferRouter.routes(), transferRouter.allowedMethods())
  .use('/close', closeRouter.routes(), closeRouter.allowedMethods())
  .use('/page', pageRouter.routes(), pageRouter.allowedMethods())
  .use('/fans', fansRouter.routes(), fansRouter.allowedMethods())
  .use('/post', postRouter.routes(), postRouter.allowedMethods());
module.exports = router;
