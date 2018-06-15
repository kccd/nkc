
module.exports = [
	{
		_id: 'dev',
		color: '#000000',
		description: '管理人员，拥有至高无上的权利',
		abbr: '运',
		displayName: '运维',
		contentClass: [],
		modifyPostTimeLimit: -1,
		defaultRole: true,
		operationsId: []
	},
	{
		_id: 'default',
		color: '#234233',
		description: '普通用户',
		abbr: '普',
		displayName: '普通用户',
		contentClass: [],
		modifyPostTimeLimit: 0.5,
		defaultRole: true,
		operationsId: [
			'logout'
		]
	},
	{
		_id: 'banned',
		color: '#a23422',
		description: '被封禁的用户',
		abbr: '禁',
		displayName: '被封用户',
		contentClass: [],
		modifyPostTimeLimit: 0,
		defaultRole: true,
		operationsId: []
	},
	{
		_id: 'visitor',
		color: '#a23422',
		description: '未登录用户',
		abbr: '游',
		displayName: '游客',
		contentClass: [],
		modifyPostTimeLimit: 0,
		defaultRole: true,
		operationsId: ['visitLogin', 'submitLogin']
	},
	{
		_id: 'moderator',
		color: '#aaaaaa',
		description: '专家',
		abbr: '专',
		displayName: '专家',
		contentClass: [],
		modifyPostTimeLimit: 0,
		defaultRole: true,
		operationsId: []
	},


	/*{
		_id: 'editor',
		color: '#aaaaaa',
		description: '编辑网站',
		abbr: '小编',
		displayName: '编辑',
		contentClass: [],
		modifyPostTimeLimit: 3*_year,
		operationsId: []
	},
	{
		_id: 'senior_moderator',
		color: '#aaaaaa',
		description: '责任版主',
		abbr: '责版',
		displayName: '责任版主',
		contentClass: [],
		modifyPostTimeLimit: 3*_year,
		operationsId: []
	},
	{
		_id: 'moderator',
		color: '#aaaaaa',
		description: '版主',
		abbr: '版',
		displayName: '版主',
		contentClass: [],
		modifyPostTimeLimit: 3*_year,
		operationsId: []
	},
	{
		_id: 'scholar',
		color: '#aaaaaa',
		description: '学者',
		abbr: '学',
		displayName: '学者',
		contentClass: [],
		modifyPostTimeLimit: 3*_year,
		operationsId: []
	},
	{
		_id: 'qc',
		color: '#aaaaaa',
		description: '负责出题',
		abbr: '题',
		displayName: '题委',
		contentClass: [],
		modifyPostTimeLimit: 3*_year,
		operationsId: []
	},
	{
		_id: 'examinated',
		color: '#aaaaaa',
		description: '已通过b卷',
		abbr: '进',
		displayName: '进士',
		contentClass: [],
		modifyPostTimeLimit: 3*_year,
		operationsId: []
	},
	{
		_id: 'mobile',
		color: '#aaaaaa',
		description: '绑定了手机号码',
		abbr: '机',
		displayName: '机友',
		contentClass: [],
		modifyPostTimeLimit: 3*_year,
		operationsId: []
	},
	{
		_id: 'email',
		color: '#aaaaaa',
		description: '绑定了邮箱',
		abbr: '笔',
		displayName: '笔友',
		contentClass: [],
		modifyPostTimeLimit: 3*_year,
		operationsId: []
	},*/
];