const Router = require('koa-router');
const loginRouter = new Router();
loginRouter
  .get('/', async (ctx, next) => {
    ctx.template = 'interface_user_login.pug';
    await next();
  })
  .post('/', async (ctx, next) => {
    //用户登录
    const {username, password} = ctx.body;
    const {
      encryptInMD5WithSalt,
      encryptInSHA256HMACWithSalt
    } = ctx.tools.encryption;
    const {UserModel, UsersPersonalModel} = ctx.db;
    const users = await UserModel.find({usernameLowerCase: username.toLowerCase()});
    if(users.length === 0) {
      ctx.throw(400, '用户名不存在, 请检查用户名');
    }
    if(users.length > 1) {
      /*历史原因, 数据库中可能出现同名或者用户名小写重复的用户, which导致一些奇怪的问题, 兼容代码*/
      ctx.throw(400, '数据库异常, 请报告: bbs@kc.ac.cn');
    }
    const user = users[0];
    const usersPersonal = await UsersPersonalModel.findOne({uid: user.uid});
    let {
      tries = 1,
      lastTry = Date.now(),
      hashType
    } = usersPersonal;
    const {hash, salt} = usersPersonal.password;
    if(tries > 10 && Date.now() - usersPersonal.lastTry < 3600000) {
      ctx.throw(400, '密码错误次数过多, 请在一小时后再试');
    }
    if(/brucezz|zzy2|3131986|1986313|19.+wjs|wjs.+86/.test(password)) {
      ctx.throw(400, '注册码已过期, 请重新考试');
    }
    switch(hashType) {
      case 'pw9':
        if(encryptInMD5WithSalt(password, salt) !== hash) {
          tries++;
          lastTry = Date.now();
          await usersPersonal.update({tries, lastTry});
          ctx.throw(400, '密码错误, 请重新输入');
        }
        break;
      case 'sha256HMAC':
        if(encryptInSHA256HMACWithSalt(password, salt) !== hash) {
          tries++;
          lastTry = Date.now();
          await usersPersonal.update({tries, lastTry});
          ctx.throw(400, '密码错误, 请重新输入');
        }
        break;
    }
    tries = 0;
    await usersPersonal.update({tries});
    //sign the cookie
    const cookieStr = encodeURI(JSON.stringify({
      uid: user.uid,
      username: user.username,
      lastLogin: Date.now()
    }));
    ctx.cookies.set('userInfo', cookieStr, {
      signed: true,
      maxAge: ctx.settings.cookie.life,
      httpOnly: true
    });
    ctx.data = {
      cookie: ctx.cookies.get('userInfo'),
      introduction: 'put the cookie in req-header when using for api'
    };
    await next()
  });

module.exports = loginRouter;