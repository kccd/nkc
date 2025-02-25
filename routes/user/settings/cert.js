const Router = require('koa-router');
const certRouter = new Router();
const {
  OnlyUnbannedUser,
  OnlyUser,
} = require('../../../middlewares/permission');
certRouter
  .get('/', OnlyUser(), async (ctx, next) => {
    const { data, db } = ctx;
    const { user } = data;
    const userPersonal = await db.UsersPersonalModel.findOnly({
      uid: user.uid,
    });
    data.certsPhotos = await userPersonal.extendCertsPhotos();
    data.privacy = userPersonal.privacy;
    ctx.template = 'interface_user_settings_cert.pug';
    await next();
  })
  .put('/', OnlyUnbannedUser(), async (ctx, next) => {
    const { body, data, db } = ctx;
    const { user } = data;
    const { displayPhoto } = body;
    const userPersonal = await db.UsersPersonalModel.findOnly({
      uid: user.uid,
    });
    const { privacy } = userPersonal;
    privacy.certPhoto = displayPhoto;
    await userPersonal.updateOne({ privacy });
    await next();
  });
module.exports = certRouter;
