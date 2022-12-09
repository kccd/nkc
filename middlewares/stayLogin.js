const languages = require('../languages');
const translate = require('../nkcModules/translate');
const {getUserInfo} = require('../nkcModules/cookie');

module.exports = async (ctx, next) => {

  const {data, db, state} = ctx;
  let userInfo = ctx.getCookie("userInfo");
	if(!userInfo) {
	  // 为了兼容app中的部分请求无法附带cookie，故将cookie放到了url中
    const {cookie} = ctx.query || {};
    userInfo = getUserInfo(cookie);
	}
  let userRoles = [];
  let userGrade = {};
  let user;
  let usersPersonal;
	if(userInfo) {
	  try {
      const now = Date.now();
	    const {uid, lastLogin = ""} = userInfo;
      const _user = await db.UserModel.findOneAndUpdate({uid}, {
        $set: {
          tlv: now
        }
      });
      if(_user) {
        _user.tlv = now;
        usersPersonal = await db.UsersPersonalModel.findOne({uid: _user.uid, secret: lastLogin}, {
          secret: 1,
          uid: 1,
        });
        if(usersPersonal) {
          user = _user;
        }
      }
      if(!user) ctx.clearCookie('userInfo');
    } catch(err) {
      ctx.clearCookie('userInfo');
    }
	}
  const languageName = 'zh_cn';
	if(!user) {
		// 游客
    userRoles = await db.UserModel.getVisitorRoles();
	} else {
		// 获取用户信息
    userGrade = await user.extendGrade();
    userRoles = await user.extendRoles();
		// 重置cookie的过期时间，让有活动的用户保持登录
    ctx.setCookie("userInfo", {
      uid: user.uid,
      username: user.username,
      lastLogin: usersPersonal.secret
    });
  }
  // 根据用户语言设置加载语言对象
  ctx.state.language = languages[languageName];
	ctx.state.lang = (type, operationId) => {
	  return translate(languageName, type, operationId);
  }

	data.userOperationsId = await db.UserModel.getOperationsIdByRoles(userRoles);
	data.userRoles = userRoles;
	data.userGrade = userGrade;
  data.user = user;
  state.user = user;
  ctx.state.uid = user? user.uid: null;

  if(data.user) {
    data.user.roles = userRoles;
    data.user.grade = userGrade;
  }
  await next();
};
