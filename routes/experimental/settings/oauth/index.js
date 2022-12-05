const Router = require('koa-router');
const translate = require("../../../../nkcModules/translate");
const {languageNames} = require("../../../../nkcModules/language");
const userRouter = new Router();
const appStatus = {
  normal: 'normal', // 正常
  disabled: 'disabled', // 被屏蔽
  deleted: 'deleted', // 被删除
  unknown: 'unknown', // 待审核
};
const appOperations = {
  signIn: 'signIn',
};
userRouter
  .use('/', async (ctx, next) => {
    ctx.template = 'experimental/settings/oauth/oauthManage.pug';
    ctx.data.type = 'oauth';
    const oauthStatus = {};
    const oauthOperations = {};
    for (let appStatusKey in appStatus) {
      oauthStatus[appStatusKey] = translate(languageNames.zh_cn,'oauth',appStatus[appStatusKey])
    }
    for (let appOperationKey in appOperations) {
      oauthOperations[appOperationKey] = translate(languageNames.zh_cn,'oauth',appOperations[appOperationKey])
    }
    ctx.data.oauthStatus = oauthStatus;
    ctx.data.oauthOperations = oauthOperations;
    await next();
  })
  .get('/', async (ctx, next) => {
    const {query, data, db, nkcModules} = ctx;
    const {c = ''} = query;
    let [searchType = '', searchContent = ''] = c.split(',');
    data.oauthList = await db.OAuthAppModel.find({status: {$ne: appStatus.deleted}}).sort({toc: 1});
    data.searchType = searchType;
    data.searchContent = searchContent;
    ctx.template = 'experimental/settings/oauth/oauthManage.pug';
    await next();
  })
  .get('/:oid/settings', async (ctx, next) => {
    const {data, db, params} = ctx;
    const {oid} = params;
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
    const {body, db, nkcModules, state, params} = ctx;
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
  });
module.exports = userRouter;
