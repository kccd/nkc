// 通过url和请求方法确定操作类型
// PARAMETER代表url中不确定的值，如 '/u/uid/settings/info' 中的uid是个变化的值

const {
	avatar,
	avatar_small,
	forum_avatar,
	r,
	rt,
	cover,
	resources,
	pfa,
	pfb,
	fundLogo,
	fundBanner,
	photo,
	photo_small
} = require('./resource');

const auth = require('./auth');
const editor = require('./editor');
const exam = require('./exam');
const e = require('./experimental');
const f = require('./forum');
const fund = require('./fund');
const login = require('./login');
const logout = require('./logout');
const me = require('./me');
const m = require('./personalForum');
const p = require('./post');
const problem = require('./problem');
const q = require('./question');
const register = require('./register');
const search = require('./search');
const sendMessage = require('./sendMessage');
const sms = require('./sms');
const t = require('./thread');
const u = require('./user');
const page = require('./page');
const download = require('./download');
const operationObj = {};


// 默认操作类型
operationObj.defaultOperations = [
	'modifyOtherPost',
	'displayRecycleMarkThreads',
	'displayDisabledPosts'
];


operationObj.operationTree = {
	home: {
		GET: 'visitHome',// 首页

		avatar,// 用户头像
		avatar_small,

		forum_avatar,// 专业logo

		r,// 资源
		rt,

		cover,// 文章封面

		resources,// 网站logo

		pfa,// 专栏logo

		pfb,// 专栏banner

		fundLogo,// 基金项目logo

		fundBanner,// 基金项目banner

		photo,// 照片
		photo_small,

		auth,// 身份认证审核

		editor,// 编辑器

		exam,// 考试

		e,// 管理

		f,//专业

		fund,// 基金

		login,// 登录

		logout,// 退出登录

		me,// 自己

		m,// 专栏

		p,// 回复

		problem,// 报告问题

		q,// 题库

		register,// 注册

		search,// 搜索

		sendMessage,// 短信

		sms,// 发信息

		t,// 文章

		u,// 用户

		download, // 编辑器自动上传图片

		page
	}
};
module.exports = operationObj;