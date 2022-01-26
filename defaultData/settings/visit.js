module.exports = {
  _id: 'visit',
  c: {
    globalAccessLimit: {
      status: false,
      description: "暂不对普通会员开放",
      whitelist: []
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
