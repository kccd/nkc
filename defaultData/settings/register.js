module.exports = {
  _id: 'register',
  c: {
    defaultSubscribeForumsId: ["81"],
    recommendUsers: {
      usersCount: 16, // 用户数
      lastVisitTime: 180, // 最后活动180天内
      digestThreadsCount: 1, // 加精文章最少为1
      threadCount: 10, // 文章数最少为10
      postCount: 50, // 回复数最少为50
      xsf: 0, // 学术分最少为0
    },
    verifyEmail: true,
    verifyMobile: true,
    verifyPassword: true,
    timeout: 60, // 分钟
    mobileCountLimit: 3, // 手机号使用次数限制
    emailCountLimit: 3, // 邮箱使用次数限制
    //注销说明
    noticeForDestroy: "1、注销账号会删除用户名，解除手机、邮箱绑定。\\n2、依据相关法律法规和政策，注销账号后，用户的历史行为依然可以被追溯。\\n3、为保证回复、评论等他人发表的内容不因你的注销行为而失效或受到破坏，依据用户协议，你的发言将会被保留，不可清除。",
  }
};