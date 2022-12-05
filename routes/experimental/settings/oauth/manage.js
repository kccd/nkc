const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const {data, db} = ctx;
    const appStatus = await db.OAuthAppModel.getAppStatus();
    data.oauthList = await db.OAuthAppModel.find({status: {$ne: appStatus.deleted}}).sort({toc: -1});
    ctx.template = 'experimental/settings/oauth/oauthManage.pug';
    await next();
  })
  .get('/:oid/settings', async (ctx, next) => {
    const {data, db, params} = ctx;
    const {oid} = params;
    const appStatus = await db.OAuthAppModel.getAppStatus();
    const {
      _id, name, desc, icon, home, operations, ips
    } = await db.OAuthAppModel.findOne({
      _id: oid,
      status: {
        $ne: appStatus.deleted
      }
    }, {
      _id: 1,
      name: 1,
      desc: 1,
      icon: 1,
      home: 1,
      operations: 1,
      ips: 1
    });
    data.oauthInfo = {
      _id,
      home,
      name,
      desc,
      icon,
      operations,
      ips,
    };
    await next();
  })
  .put('/:oid/settings', async (ctx, next) => {
    const {body, db, nkcModules, params} = ctx;
    const {oid} = params;
    const name = body.fields.name.trim();
    const desc = body.fields.desc.trim();
    const home = body.fields.home.trim();
    const ips = JSON.parse(body.fields.ips);
    const operations = JSON.parse(body.fields.operations);
    let match={
      name,
      desc,
      home,
      operations,
      ips,
    };
    let icon;
    if(body.fields.icon){
      match.icon = body.fields.icon.trim();
    } else {
      icon = body.files.icon;
    }
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

    await db.OAuthAppModel.updateOne(
      {_id: oid},
      {
        $set: {...match}
      });
    if(icon){
      await db.AttachmentModel.saveOAuthAppIcon(oid, icon);
    }

    await next();
  })
  .delete('/:oid', async (ctx, next) => {
    const {db, params} = ctx;
    const {oid} = params;
    const oauth = await db.OAuthAppModel.find({_id: oid});
    if(!oauth) ctx.throw(400, "第三方应用不存在");
    const appStatus = await db.OAuthAppModel.getAppStatus();
    await db.OAuthAppModel.update({_id: oid},{status: appStatus.deleted});
    await next();
  })
  .put('/:oid/ban', async (ctx, next) => {
    const {body, db, params} = ctx;
    const {status} = body;
    const {oid} = params;
    const oauth = await db.OAuthAppModel.find({_id: oid});
    if(!oauth) ctx.throw(400, "第三方应用不存在");
    await db.OAuthAppModel.update({_id: oid},{status});
    await next();
  })
  .post('/:oid/secret', async (ctx, next) => {
    const {db, params} = ctx;
    const {oid} = params;
    const appSecret = await db.OAuthAppModel.createAppSecret();
    const oauth = await db.OAuthAppModel.find({_id: oid});
    if(!oauth) ctx.throw(400, "第三方应用不存在");
    await db.OAuthAppModel.updateOne({_id: oid},{secret: appSecret});
    await next();
  });

module.exports = router;
