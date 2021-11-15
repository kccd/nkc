// 通过url和请求方法确定操作类型
// PARAMETER代表url中不确定的值，如 '/u/uid/settings/info' 中的uid是个变化的值
const resourceObj = require('./resource');
const {
	avatar,
  banner,
	shopLogo,
	poster,
	avatar_small,
	forum_avatar,
	r,
	rt,
	rm,
	ro,
	cover,
	frameImg,
	resources,
	pfa,
	pfb,
	fundLogo,
	fundBanner,
	photo,
	photo_small,
	logo,
} = resourceObj;

const editor = require('./editor');
const edit = require('./edit');
const exam = require('./exam');
const e = require('./experimental');
const f = require('./forum');
const survey = require("./survey");
const fund = require('./fund');
const login = require('./login');
const logout = require('./logout');
const me = require('./me');
const column = require('./column');
const test = require("./test");
const m = require('./columns');
const p = require('./post');
const problem = require('./problem');
const register = require('./register');
const search = require('./search');
const sendMessage = require('./sendMessage');
const t = require('./thread');
const u = require('./user');
const page = require('./page');
const download = require('./download');
const forgotPassword = require('./forgotPassword');
const app = require('./app');
const message = require('./message');
const activity = require('./activity');
const s = require('./share');
const friend = require('./friend');
const subscription = require('./homeSubscription');
const lottery = require('./lottery');
const shop = require('./shop');
const account = require('./account');
const complaint = require("./complaint");
const imageEdit = require('./imageEdit');
const rs = require("./resources");
const protocol = require('./protocol');
const review = require("./review");
const threads = require("./threads");
const newResource = require("./newResource");
const library = require("./library");
const libraries = require("./libraries");
const nkc = require("./nkc");
const reader = require("./reader");
const appDownload = require("./appDownload");
const sticker = require("./sticker");
const stickers = require("./stickers");
const note = require("./note");
const tools = require('./tools');
const ipinfo = require('./ipinfo');
const blacklist = require('./blacklist');
const attachment = require("./attachment");
const verifications = require('./verifications');
const payment = require('./payment');
const link = require('./link');
const community = require('./community');
const watermark = require('./watermark');
const operationObj = {};


// 默认操作类型，没有路由与之对应的操作权限
operationObj.defaultOperations = [
	'modifyOtherPosts',
	'displayRecycleMarkThreads',
	'displayDisabledPosts',
	'displayPostHideHistories',
	'displayFundNoVerifyBills',
	'displayFundBillsSecretInfo',
	'displayFundApplicationFormSecretInfo',
	'getAnyBodyPhoto',// 忽略相册、证书照片的权限
	'removeAnyBodyPhoto',// 忽略相册、证书照片的权限
  'canSendToEveryOne', // 跳过`仅接收好友信息`限制
  'creditXsf',
  'modifyAllQuestions', // 可修改审核过的试题
  'viewAllPaperRecords', // 可查看所有的考试记录
  'removeAllQuestion', // 可删除别人出的试题
  'superModerator', // 超级专家，所有专业的专家权限
  "getAnyBodyShopCert", // 可查看任何人的商城凭证
  "viewUserAllFansAndFollowers", // 可查看用户的所有关注的人和粉丝
  "showSecretSurvey", // 查看隐藏的调查结果
  "showSurveyCertLimit", // 发起调查时可更具证书限制参与的用户
  "getAllMessagesResources", // 查看所有的短消息资源
  "topAllPost", // 置顶任何人的回复
  "modifyAllResource", // 可修改任何人的附件
	"visitAllUserProfile", // 可查看任何人的个人中心
	"managementNote", // 可屏蔽编辑任何人的笔记
	"viewUserScores", // 可在用户名片页查看用户的积分
  "viewUserCode", // 可查看任意用户的动态码
];


operationObj.operationTree = {
	home: {
		GET: 'visitHome',// 首页

		// 适配dz
		'forum.php': {
			GET: 'discuz'
		},
		'index.php': {
			GET: 'discuz'
		},
		'read.php': {
			GET: 'discuz'
		},
		'read': {
			PARAMETER: {
				GET: 'discuz',
				PARAMETER: {
					GET: 'discuz',
					PARAMETER: {
						GET: 'discuz'
					}
				}
			}
		},
		'home.php': {
			GET: 'discuz'
		},

		logo, // 网站logo

		poster, //活动海报
		avatar,// 用户头像
		avatar_small,
    banner, // 用户背景
		shopLogo, //店铺logo

		forum_avatar,// 专业logo

		r,// 资源
		rs,
		rt, // 小号图 150
		rm, // 中号图 640
		ro, // 原图 3840

		default: resourceObj.default,
		attachIcon: resourceObj.attachIcon,

		cover,// 文章封面

		frameImg,// 视频封面

		resources,// 网站logo

		pfa,// 专栏logo

		pfb,// 专栏banner

		fundLogo,// 基金项目logo

		fundBanner,// 基金项目banner

		photo,// 照片
		photo_small,

		editor,// 编辑器
    edit,

		exam,// 考试

		e,// 后台管理

		nkc, // 前台管理

		f,//专业

		fund,// 基金

		login,// 登录

		logout,// 退出登录

		me,// 自己

		m,// 专栏

		p,// 回复

		problem,// 报告问题

		register,// 注册

		search,// 搜索

		sendMessage,// 短信

		t,// 文章

		u,// 用户

		download, // 编辑器自动上传图片

		forgotPassword,

		page,

		app,// 手机app

		activity, //活动

		s, // 分享

		message, // 信息（新）

    friend, // 好友

    subscription, // 首页我的关注

		lottery, // 抽奖页

		shop, //商城

		imageEdit, // 编辑图片

		protocol, // 论坛协议

    account, // 个人中心

    complaint, // 用户投诉

    review, // 审核

    column, // 专栏申请

    threads, // 文章批量管理

    survey, // 投票、调查问卷、打分

    nr: newResource, // 新的资源路由

    library, // 文库
    libraries, // 文库

		appDownload, // 为了兼容旧版APP下载 2020-1-18，APP更新多个版本之后可移除该路由

		reader, // 阅读器 pdf

		sticker, // 表情中心
		stickers, // 共享表情
		note, // 批注
		tools, // 网站工具
		ipinfo, // ip信息
		blacklist, // 黑名单
		a: attachment, // 网站附件， 通用接口
		verifications, // 图形验证码相关
		payment, // 支付相关
		l: link, // 外链跳转
    c: community, // 社区
		wm: watermark, //水印
    test,
	}
};
module.exports = operationObj;
