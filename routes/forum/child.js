const { Public } = require('../../middlewares/permission');

const router = require('koa-router')();
router.get('/', Public(), async (ctx, next) => {
  const { params, query, data, state, db } = ctx;
  const { type } = query;
  const { fid } = params;
  const forum = await db.ForumModel.findOnly({ fid });
  await forum.ensurePermission(data.userRoles, data.userGrade, data.user);
  const readableForumsId = await db.ForumModel.getReadableForumsIdByUid(
    state.uid,
  );
  let forumsId = [];
  if (type === 'all') {
    forumsId = await forum.getAllBottomLayerChildForumsId();
  }
  data.forumsId = forumsId.filter((fid) => readableForumsId.includes(fid));
  await next();
});
module.exports = router;
