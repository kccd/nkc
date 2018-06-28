module.exports = [
	{
		_id: 'dailyLogin',
		description: '日常登陆',
		change: 1,
		count: 0
	},
	{
		_id: 'violation',
		description: '违规',
		change: -10,
		count: 0
	},
	{
		_id: 'postToThread',
		description: '回复文章',
		change: 1,
		count: 0
	},
	{
		_id: 'postToForum',
		description: '发表文章',
		change: 2,
		count: 0
	},
	{
		_id: 'threadBlocked',
		description: '文章被屏蔽',
		change: -10,
		count: 0
	},
	{
		_id: 'postBlocked',
		description: '回复被屏蔽',
		change: -5,
		count: 0
	},
	{
		_id: 'subscribeForum',
		description: '关注专业',
		change: 1,
		count: 0
	},
	{
		_id: 'unSubscribeForum',
		description: '取消关注专业',
		change: -1,
		count: 0
	},
	{
		_id: 'followed',
		description: '被用户关注',
		change: 1,
		count: 0
	},
	{
		_id: 'unFollowed',
		description: '被用户取消关注',
		change: -1,
		count: 0
	},
	{
		_id: 'fundDonation',
		description: '基金捐款',
		change: 10,
		count: 0
	},
	{
		_id: 'liked',
		description: '回复被赞',
		change: 1,
		count: 0
	},
	{
		_id: 'unLiked',
		description: '取消回复被赞',
		change: -1,
		count: 0
	},
	{
		_id: 'reportIssue',
		description: '上报问题',
		change: 1,
		count: 0
	},
	{
		_id: 'modifyUsername',
		description: '修改用户名',
		change: -200,
		count: 0
	},
	{
		_id: 'digestThread',
		description: '文章被加精',
		change: 5,
		count: 0
	},
	{
		_id: 'unDigestThread',
		description: '文章被取消加精',
		change: -5,
		count: 0
	},
	{
		_id: 'waterPay',
		description: '购买水印服务',
		change: -200,
		count: -1
	}
];