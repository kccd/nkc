const Router = require('koa-router');
const router = new Router();
router.post('/', async (ctx, next) => {
  const { db, body, params } = ctx;
  const { uid } = params;
  const targetUser = await db.UserModel.findOnly({ uid });
  const { type } = body;
  if (type === 'avatar') {
    await db.UserModel.updateOne(
      { uid: targetUser.uid },
      {
        $set: {
          avatar: '',
        },
      },
    );
    await db.AttachmentModel.disableAttachment(targetUser.avatar);
  } else if (type === 'banner') {
    await db.UserModel.updateOne(
      { uid: targetUser.uid },
      {
        $set: {
          banner: '',
          homeBanner: '',
        },
      },
    );
    await db.AttachmentModel.disableAttachment(targetUser.banner);
    await db.AttachmentModel.disableAttachment(targetUser.homeBanner);
  } else if (type === 'username') {
    await db.UserModel.clearUsername({
      uid: targetUser.uid,
      ip: ctx.address,
      port: ctx.port,
    });
  } else if (type === 'description') {
    await db.UserModel.clearUserDescription(targetUser.uid);
  }
  await next();
});
module.exports = router;
