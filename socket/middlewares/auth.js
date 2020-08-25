const Cookies = require('cookies-string-parse');
const cookieConfig = require("../../config/cookie");
const func = async (socket, next) => {
  // 从cookie中获取用户信息
  const {handshake, NKC} = socket;
  const {db, data} = NKC;
  let userOperationsId = [], userRoles = [], userGrade, user;
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
    userOperationsId = visitorRole.operationsId;
    userRoles = [visitorRole];
  } else {
    if(!user.certs.includes('default')) {
      user.certs.unshift('default');
    }
    if(user.xsf > 0) {
      if(!user.certs.includes('scholar')) {
        user.certs.push('scholar');
      }
    } else {
      const index = user.certs.indexOf('scholar');
      if(index !== -1) {
        user.certs.splice(index, 1);
      }
    }
    if(user.certs.includes("banned")) {
      user.certs = ["banned"];
    }
    userGrade = await user.extendGrade();
    if(userGrade) {
      userOperationsId = userOperationsId.concat(userGrade.operationsId);
    }
    await Promise.all(user.certs.map(async cert => {
      const role = await db.RoleModel.extendRole(cert);
      if(!role) return;
      userRoles.push(role);
      for(let operationId of role.operationsId) {
        if(!userOperationsId.includes(operationId)) {
          userOperationsId.push(operationId);
        }
      }
    }));
  }
  data.userOperationsId = userOperationsId;
  data.userGrade = userGrade;
  data.userRoles = userRoles;
  data.user = user;
  await next();
};
module.exports = func;
