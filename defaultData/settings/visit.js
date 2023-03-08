const {settingIds} = require('../../settings/serverSettings');
module.exports = {
  _id: settingIds.visit,
  c: {
    globalAccessLimit: {
      status: false,
      userDescription: "暂不对普通会员开放",
      visitorDescription: '暂不对游客开放',
      whitelist: {
        rolesId: [],
        gradesId: [],
        relation: 'or', // or and
      }
    },
    globalLimitVisitor: {
      status: false,
      description: '暂不对游客开放，请登录或注册。'
    },
    userHomeLimitVisitor: {
      status: false,
      description: '暂不对游客开放，请登录或注册。'
    }
  }
}
