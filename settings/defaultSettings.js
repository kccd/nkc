module.exports = [

	{// 系统设置
		type: 'system',
		counters: {
			operationTypes: 0,
			drafts: 0,
			fundDocuments: 0,
			fundApplicationForms: 0,
			collections: 0,
			sms: 0,
			questions: 0,
			threadTypes: 0,
			posts: 0,
			threads: 0,
			users: 0,
			resources: 0,
			photos: 0,
			forums: 0
		},
		popPersonalForums: [],
		ads: []
	},

	{// 基金设置
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
	},

	{// 科创币
		type: 'kcb',
		defaultUid: '',
		changeUsername: 200
	},

	{// 网站信息设置
		type: 'server',
		websiteName: '科创论坛',
		serverName: 'nkc $ server',
		port: 9000,
		httpsPort: 10443,
		useHttps: false,
		databaseName: 'rescue',
		address: '0.0.0.0',
		github: 'https//github.com/kccd/nkc.git',
		copyright: '科创研究院 (c)2005-2016',
		record: '蜀ICP备11004945号-2 川公网安备51010802000058号',
		description: '每天前进一小步 - 发展科技爱好，倡导科学理性, Since 2001.',
		brief: '专业极客的学术社区',
		keywords: ['科创论坛', '专业创客', '极客论坛', '创客论坛', '创客教育', '电磁炮', '高斯枪', '特斯拉线圈', '科技小制作', '电子DIY'],
		language: 'zh_CN'
	}
];