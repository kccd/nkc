const tools = require('../tools');
const settings = require('../settings');
const nkcModules = require('../nkcModules');
const db = require('../dataModels');
const {logger} = nkcModules;

module.exports = async (ctx, next) => {
  ctx.reqTime = new Date();
  ctx.db = db;
  ctx.nkcModules = nkcModules;
  ctx.tools = tools;
  ctx.settings = settings;
  ctx.data = Object.create(null);
  ctx.data.site = settings.site;
  ctx.data.twemoji = settings.editor.twemoji;
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
};