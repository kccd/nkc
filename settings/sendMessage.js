module.exports = {
  // 手机验证码有效时间 15分钟
  mobileCodeTime: 15*60*1000,
  // 邮件激活的有效时间 2分钟以内
  emailCodeTime: 2*60*1000,
  // 一天最多发送邮件的数量
  sendEmailCount: 5,
  // 一天最多发送短信验证码数量
  sendMobileCodeCount: 5,
};