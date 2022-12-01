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
    // if(t !== 'default') {
    //   if(t === 'scholar') {
    //     match.xsf = {$gt: 1};
    //   } else {
    //     match.certs = t;
    //   }
    // }
    // if(searchType === 'uid') {
    //   const targetOAuth = await db.OAuthAppModel.findOne({uid: searchContent.trim()});
    //   match.uid = targetOAuth? targetOAuth.uid: '';
    // } else if(searchType === 'username') {
    //   const targetUser = await db.OAuthAppModel.findOne({usernameLowerCase: searchContent.toLowerCase()});
    //   match.uid = targetUser? targetUser.uid: '';
    // } else if(searchType === 'ip') {
    //   const usersPersonal = await db.UsersPersonalModel.find({regIP: searchContent.trim()}, {uid: 1});
    //   match.uid = {$in: usersPersonal.map(u => u.uid)};
    // } else if(searchType === 'mobile') {
    //   const usersPersonal = await db.UsersPersonalModel.find({mobile: searchContent.trim()}, {uid: 1});
    //   match.uid = {$in: usersPersonal.map(u => u.uid)};
    // } else if(searchType === 'email') {
    //   const usersPersonal = await db.UsersPersonalModel.find({email: searchContent.trim().toLowerCase()}, {uid: 1});
    //   match.uid = {$in: usersPersonal.map(u => u.uid)};
    // }
    // const count = await db.OAuthAppModel.countDocuments();
    // paging = nkcModules.apiFunction.paging(page, count);
    // console.log('paging',paging)

    // data.paging = paging;
    data.oauthList = await db.OAuthAppModel.find();
    data.c = c;
    data.searchType = searchType;
    data.searchContent = searchContent;
    ctx.template = 'experimental/settings/oauth/oauthManage.pug';
    await next();
  });
module.exports = userRouter;
