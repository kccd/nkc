const router = require('koa-router')();
const articleRouter = require('./article');
const momentRouter = require('./moment');
router
  .use('/', async (ctx, next) => {
    const {db, data, state} = ctx;
    await db.MomentModel.checkAccessControlPermissionWithThrowError({
      uid: state.uid,
      rolesId: data.userRoles.map(r => r._id),
      gradeId: state.uid? data.userGrade._id: undefined,
      isApp: state.isApp,
    });
    await next();
  })
  .use('/m', momentRouter.routes(), momentRouter.allowedMethods())
  .use('/a', articleRouter.routes(), articleRouter.allowedMethods());
module.exports = router;
