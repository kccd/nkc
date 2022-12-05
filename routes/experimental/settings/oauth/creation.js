const router = require('koa-router')();

router
  .get('/', async (ctx, next) => {
    // ctx.remoteTemplate = 'oauth/creation/creation.pug';
    await next();
  })
  .post('/', async (ctx, next) => {
    const {body, db, nkcModules, state} = ctx;
    const name = body.fields.name.trim();
    const desc = body.fields.desc.trim();
    const home = body.fields.home.trim();
    const ips = JSON.parse(body.fields.ips);
    const operations = JSON.parse(body.fields.operations);
    const {icon} = body.files;
    const {checkString} = nkcModules.checkData;
    checkString(name, {
      name: '名称',
      minLength: 1,
      maxLength: 100,
    });
    checkString(desc, {
      name: '简介',
      minLength: 1,
      maxLength: 2000,
    });
    checkString(home, {
      name: '主页链接',
      minLength: 1,
      maxLength: 2000,
    });
    const app = await db.OAuthAppModel.createApp({
      uid: state.uid,
      name,
      desc,
      home,
      operations,
      ips
    });
    await db.AttachmentModel.saveOAuthAppIcon(app._id, icon);
    await next();
  });
module.exports = router;
