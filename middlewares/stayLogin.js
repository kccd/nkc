const languages = require('../languages');
const translate = require('../nkcModules/translate');
const {files: fileOperations} = require('../settings/operationsType');
const {getUserInfo} = require('../nkcModules/cookie');

module.exports = async (ctx, next) => {

  const isResourcePost = fileOperations.includes(ctx.data.operationId);
  const {data, db, state} = ctx;
  let userInfo = ctx.getCookie("userInfo");
	if(!userInfo) {
	  // 为了兼容app中的部分请求无法附带cookie，故将cookie放到了url中
    const {cookie} = ctx.query || {};
    userInfo = getUserInfo(cookie);
	}
  let userRoles;
  let userGrade = null;
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

  // 获取用户的关注
  if(data.user && !isResourcePost) {
    data.user.subUid = await db.SubscribeModel.getUserSubUsersId(data.user.uid);
    ctx.state.subUsersId = [...data.user.subUid];
    ctx.state.visibleFid = await db.ForumModel.visibleFid(
      data.userRoles,
      data.userGrade,
      data.user
    );
    // 关注的专业对象 用在手机网页侧栏专业导航
    ctx.state.subForums = await db.ForumModel.getUserSubForums(data.user.uid, ctx.state.visibleFid);
    ctx.state.subForumsId = await db.SubscribeModel.getUserSubForumsId(data.user.uid);
    ctx.state.subColumnsId = await db.SubscribeModel.getUserSubColumnsId(data.user.uid);
    ctx.state.columnPermission = await db.UserModel.ensureApplyColumnPermission(data.user);
    ctx.state.userColumn = await db.UserModel.getUserColumn(data.user.uid);
    ctx.state.userScores = await db.UserModel.getUserScores(data.user.uid);

    data.user.roles = userRoles;
    data.user.grade = userGrade;
  }
  await next();
};
