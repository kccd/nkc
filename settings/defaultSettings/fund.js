module.exports = {
	type: 'fund',
	description: '这是基金描述',
	terms: '这是基金协议',
	money: 0,
	readOnly: false,
	closed: {
		status: false,
		openingHours: Date.now(),
		reason: '关闭原因',
		uid: '',
		username: '',
		closingTime: Date.now()
	},
	donationDescription: '捐款说明',
	fundPoolDescription: '资金池介绍'
};