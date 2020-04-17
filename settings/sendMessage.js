module.exports = {
	// 手机验证码有效时间 15分钟
	mobileCodeTime: 15*60*1000,
	// 邮件激活的有效时间 一小时以内
	emailCodeTime: 60*60*1000,
	// 一天最多发送邮件的数量
	sendEmailCount: 5,
	sameIpSendEmailCount: 20,
	// 一天最多发送短信验证码数量
	sendMobileCodeCount: 6,
	// 一天同一ip发送短信验证码数量
	sendMobileCodeCountSameIp: 10
};