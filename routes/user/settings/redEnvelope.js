const Router = require('koa-router');
const router = new Router();
router
  .get('/', async (ctx, next) => {
    ctx.template = 'interface_user_settings_red_envelope.pug';
    await next();
  })
  .put('/', async (ctx, next) => {
    const {body, data, db} = ctx;
    const {user} = data;
    let {close} = body;
    close = !!close;
    const q = {
      'lotterySettings.close': close
    };
    if(close) {
      q['lotterySettings.status'] = false;
    }
    await db.UsersGeneralModel.updateOne({uid: user.uid}, {
      $set: q
    });
    await next();
  });
module.exports = router;
