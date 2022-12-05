// const translate = require("../../nkcModules/translate");
// const {languageNames} = require("../../nkcModules/language");
// const router = require('koa-router')();
// const appOperations = {
//   signIn: 'signIn',
// };
// router
//   .get('/', async (ctx, next) => {
//     ctx.remoteTemplate = 'oauth/creation/creation.pug';
//     const oauthOperations = {};
//     for (let appOperationKey in appOperations) {
//       oauthOperations[appOperationKey] = translate(languageNames.zh_cn,'oauth',appOperations[appOperationKey])
//     }
//     ctx.data.oauthOperations = oauthOperations;
//     await next();
//   })
//   .post('/', async (ctx, next) => {
//     const {body, db, nkcModules, state} = ctx;
//     const name = body.fields.name.trim();
//     const desc = body.fields.desc.trim();
//     const home = body.fields.home.trim();
//     const ips = JSON.parse(body.fields.ips);
//     const operations = body.fields.operations;
//     const {icon} = body.files;
//     const {checkString} = nkcModules.checkData;
//     checkString(name, {
//       name: '名称',
//       minLength: 1,
//       maxLength: 100,
//     });
//     checkString(desc, {
//       name: '简介',
//       minLength: 1,
//       maxLength: 2000,
//     });
//     checkString(home, {
//       name: '主页链接',
//       minLength: 1,
//       maxLength: 2000,
//     });
//     const app = await db.OAuthAppModel.createApp({
//       uid: state.uid,
//       name,
//       desc,
//       home,
//       operations,
//       ips
//     });
//     await db.AttachmentModel.saveOAuthAppIcon(app._id, icon);
//     await next();
//   });
// module.exports = router;
