const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const fundApplicationHistorySchema = new Schema({
	applicationFormId: {
		type: Number,
		required: true,
		index: 1
	},
	order: {
		type: Number,
		default: '',
		index: 1
	},
	year: {
		type: String,
		default: null
	},
	code: {// 申请编号 如：2017A02
		type: String,
		default: ''
	},
	fundId: {
		type: String,
		required: true,
		index: 1
	},
	toc: {
		type: Date,
		default: Date.now,
		index: 1
	},
	timeToSave: {
		type: Date,
		default: Date.now,
		index: 1
	},
	tlm: {
		type: Date,
		index: 1
	},
	from: {
		type: String,
		required: true
	},
	publicity: { // 示众
		timeOfBegin: {
			type: Date,
			default: null,
			index: 1
		},
		timeOfOver: {
			type: Date,
			default: null,
			index: 1
		}
	},
	uid: {
		type: String,
		required: true,
		index: 1
	},
	budgetMoney: { // 预算
		type: Schema.Types.Mixed,
		default: null
		/*
		{
			purpose: String,
			money: Number,
			count: Number,
			total: Number
		}
		*/
	},
	projectCycle: { // 预计周期
		type: Number,
		default: null,
		index: 1
	},
	threadsId: {
		applying: {// 申请时附带的帖子
			type: [String],
			default:[]
		},
		completed: { // 结项时附带的帖子
			type: [String],
			default:[]
		}
	},
	papersId: {
		applying: {
			type: [String],
			default:[]
		},
		completed: {
			type: [String],
			default:[]
		}
	},
	account: {
		paymentType: {
			type: String,
			default: null
		},
		number: {
			type: Number,
			default: null
		}
	},
	projectId: {
		type: Number,
		default: null,
		index: 1
	},
	project: {
		type: Schema.Types.Mixed,
		default: null
	},
	status: {
		submitted: { // 已提交申请
			type: Boolean,
			default: null
		},
		usersSupport: { // 获得网友支持
			type: Boolean,
			default: null,
			index: 1
		},
		projectPassed: { // 项目审核通过
			type:Boolean,
			default: null,
			index: 1
		},
		adminSupport: { // 管理员同意
			type: Boolean,
			default: null,
			index: 1
		},
		remittance: { // 已打款
			type: Boolean,
			default: null,
			index: 1
		},
		completed: { // 项目已完成
			type: Boolean,
			default: null,
			index: 1
		},
		successful: { // 项目研究是否成功
			type: Boolean,
			default: null,
			index: 1
		},
		excellent: { // 优秀项目
			type: Boolean,
			default: null,
			index: 1
		}
	},
	useless: { //disabled: 被封禁，revoked: 被永久撤销，exceededModifyCount: 超过修改次数， null: 数据有效
		type: String,
		default: null,
		index: 1
	},
	lock: {
		auditing: {
			type: Boolean,
			default: false,
		},
		uid: {
			type: String,
			default: null,
		},
		timeToOpen: {
			type: Date,
			default: Date.now
		},
		timeToClose: {
			type: Date,
			default: Date.now
		}
	},
	modifyCount: {// 已经修改的次数
		type: Number,
		default: 0
	},
	supportersId: {// 支持的人
		type: [String],
		default: [],
		index: 1
	},
	objectorsId: { // 反对的人
		type: [String],
		default: [],
		index: 1
	},
	remittance: {
		/*
		* status: null, true, false
		* money: number
		* article: id 阶段性报告
		* */
		type: [Schema.Types.Mixed],
		default: []
	}
}, {
	collection: 'fundApplicationHistories',
});

const FundApplicationHistoryModel = mongoose.model('fundApplicationHistories', fundApplicationHistorySchema);
module.exports = FundApplicationHistoryModel;