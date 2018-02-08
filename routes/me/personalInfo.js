const Router = require('koa-router');
const router = new Router();

router
  .post('/', async (ctx, next) => {
    const {data, db, body} = ctx;
    const {QQ, wechat, birthday} = body;
    const {UsersPersonalModel} = db;
    const {user} = data;
    const up = await UsersPersonalModel.findOnly({uid: user.uid});
    try {
      if(!up.personalInfo)
        up.personalInfo = {};
      if (QQ)
        up.personalInfo.QQ = QQ;
      if (wechat)
        up.personalInfo.wechat = wechat;
      if (birthday)
        up.personalInfo.birthday = birthday;
      up.markModified('personalInfo');
      await up.save()
    } catch(e) {
      return ctx.throw(400, e.message)
    }
    return ctx.redirect('/me', 301)
  });

module.exports = router;