const tools = require('./tools');
const settings = require('./settings');
const nkcModules = require('./nkcModules');
const mainRouter = require('./routes');
const Koa = require('koa');
require('colors');
const bodyParser = require('koa-bodyparser');
const staticServe = require('koa-static');
const db = require('./dataModels');
const app = new Koa();
const logger = nkcModules.logger;
const permissions = nkcModules.permissions;

app.keys = [settings.cookie.secret];
app.use(async (ctx, next) => {
  ctx.reqTime = new Date();
  ctx.db = db;
  ctx.nkcModules = nkcModules;
  ctx.tools = tools;
  ctx.settings = settings;
  ctx.data = Object.create(null);
  ctx.data.site = settings.site;
  ctx.data.contentClasses = {
    "null": true,
    "images": true,
    "non_images": false,
    "non_public": false,
    "": true
  };
  ctx.data.permittedOperations = {
    "listAllQuestions": true,
    "deleteElseQuestions": true,
    "viewLatest": true,
    "viewPersonalActivities": true,
    "viewEditor": true,
    "viewThread": true,
    "viewForum": true,
    "viewHome": true,
    "viewUser": true,
    "viewPersonalForum": true,
    "useSearch": true,
    "viewLocalSearch": true,
    "viewExam": true,
    "submitExam": true,
    "viewRegister": true,
    "viewRegister2": true,
    "userRegister": true,
    "userLogin": true,
    "viewLogin": true,
    "viewLogout": true,
    "viewPanorama": true,
    "viewCollectionOfUser": true,
    "getResourceThumbnail": true,
    "getResource": true,
    "exampleOperation": true,
    "getGalleryRecent": true,
    "getForumsList": true,
    "viewPage": true,
    "viewTemplate": true,
    "receiveMobileMessage": true,
    "getRegcodeFromMobile": true,
    "forgotPassword": true,
    "newPasswordWithToken": true,
    "pchangePassword": true,
    "viewForgotPassword": true,
    "viewForgotPassword2": true,
    "getMcode": true,
    "getMcode2": true,
    "userPhoneRegister": true,
    "userMailRegister": true,
    "refreshicode": true,
    "refreshicode3": true,
    "viewActiveEmail": true
  };
  ctx.data.getcode = false;
  //template file path prefix
  Object.defineProperty(ctx, 'template', {
    get: function() {
      return './pages/' + this.__templateFile
    },
    set: function(fileName) {
      this.__templateFile = fileName
    }
  });
  //error handling
  try {
    await next();
  } catch(err) {
    ctx.error = err;
    ctx.status = err.statusCode || err.status || 500;
    if(process.ENV === 'production')
      ctx.body = {
        message: err.message
      };
    else
      ctx.body = err.toString().replace(/\|/g, '<br />')
  }
  finally {
    ctx.status = ctx.response.status;
    const passed = Date.now() - ctx.reqTime;
    ctx.set('X-Response-Time', passed);
    ctx.processTime = passed.toString();
    await logger(ctx);
  }
});
app.use(staticServe('./pages'));
app.use(bodyParser());
app.use(async (ctx, next) => {
  ctx.body = ctx.request.body;
  await next()
});
app.use(async (ctx, next) => {
  //cookie identification
  const userInfo = ctx.cookies.get('userInfo');
  if(!userInfo) {
    await next();
  } else {
    const {username, uid} = JSON.parse(userInfo);
    const user = await db.UserModel.findOne({uid});
    if (user.username !== username) {
      ctx.cookies.set('userInfo', '');
      ctx.status = 401;
      ctx.error = new Error('缓存验证失败');
      ctx.redirect('/login')
    }
    ctx.data.user = user;
    await next();
  }
});
// app.use(permissions);
app.use(mainRouter.routes());
app.use(async (ctx, next) => {
  //ctx.redirect('/register/mobile');
  const type = ctx.accepts('json', 'html');
  switch(type) {
    case 'json':
      ctx.type = 'json';
      ctx.body = ctx.data;
      break;
    default:
      ctx.type = 'html';
      try {
        ctx.body = ctx.nkcModules.render(ctx.template, ctx.data);
      } catch(e) {
        ctx.throw(500, e)
      }
  }
  await next();
});

module.exports = app.callback();
