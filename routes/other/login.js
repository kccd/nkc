const Router = require('koa-router');
const loginRouter = new Router();
loginRouter
  .get('/', async (ctx, next) => {
    ctx.data = {
      "site": {
          "name": "科创论坛",
          "description": "科技爱好综合社区",
          "copyright": "科创研究院 (c)2005-2016"
      },
      "server": {
        "name": "科创"
      },
      "contentClasses": {
          "null": true,
          "images": true,
          "non_images": false,
          "non_public": false,
          "": true
      },
      "permittedOperations": {
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
      },
      "template": "/home/lz/projects/nkc2/nkc_modules/jade/interface_user_login.pug"
    };
    ctx.template = 'interface_user_login.pug';
    next();
  })
  .post('/', async (ctx, next) => {
    const {username, password} = ctx.body;
    const {
      encryptInMD5WithSalt,
      encryptInSHA256HMACWithSalt
    } = ctx.tools.encryption;
    const {UserModel, UsersPersonalModel} = ctx.db;
    const
    next()
  });

module.exports = loginRouter;