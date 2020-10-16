const Cookies = require('cookies-string-parse');
const cookieConfig = require("../../config/cookie");
const func = async (socket, next) => {
  // 从cookie中获取用户信息
  const {handshake, NKC} = socket;
  const {db, data, address} = NKC;
  let userOperationsId, userRoles = [], userGrade, user;
  const cookies = new Cookies(handshake.headers.cookie, {
    keys: [cookieConfig.secret]
  });
  let userInfo = cookies.get('userInfo', {
    signed: true
  });
  if(userInfo) {
    try{
      userInfo = Buffer.from(userInfo, "base64").toString();
      userInfo = JSON.parse(userInfo);
      const {uid} = userInfo;
      user = await db.UserModel.findOnly({uid});
    } catch(err) {}
  }
  if(!user) {
    const visitorRole = await db.RoleModel.extendRole('visitor');
    data.userRoles = [visitorRole];
    userOperationsId = visitorRole.operationsId;
  } else {
    userRoles = await user.extendRoles();
    userGrade = await user.extendGrade();
    userOperationsId = await user.getUserOperationsId();
  }
  data.userOperationsId = userOperationsId;
  data.userRoles = userRoles;
  data.userGrade = userGrade;
  data.user = user;
  await next();
};
module.exports = func;
