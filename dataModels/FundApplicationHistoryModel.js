const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const fundApplicationHistorySchema = new Schema({
	applicationFormId: {
		type: Number,
		required: true,
		index: 1
	},
	timeToSave: {
		type: Date,
		default: Date.now,
		index: 1
	},
	year: {
		type: String,
		default: null
	},
	order: {
		type: Number,
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
	fixedMoney: {
		type: Boolean,
		required: true
	},
	toc: {
		type: Date,
		default: Date.now
	},
	timeToSubmit: {
		type: Date,
		default: null
	},
	timeToPassed: {
		type: Date,
		default: null
	},
	timeOfCompleted: {
		type: Date,
		default: null
	},
	tlm: {
		type: Date
	},
	from: {
		type: String,
		required: true
	},
	publicity: { // 示众
		timeOfBegin: {
			type: Date,
			default: null
		},
		timeOfOver: {
			type: Date,
			default: null
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
		default: null
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
			type: String,
			default: null
		},
		name: {
			type: String,
			default: null
		},
		bankName: {
			type: String,
			default: null
		}
	},

	project: Schema.Types.Mixed,
	members: Schema.Types.Mixed,
	applicant: Schema.Types.Mixed,
	adminAudit: Schema.Types.Mixed,
	userInfoAudit: Schema.Types.Mixed,
	projectAudit: Schema.Types.Mixed,
	moneyAudit: Schema.Types.Mixed,
	comments: Schema.Types.Mixed,
	threads: Schema.Types.Mixed,

	status: {
		submitted: { // 判断是否是提交过的申请表，下边的lock.submitted作用是判断申请表当前是否提交。
			type: Boolean,
			default: null
		},
		usersSupport: { // 获得网友支持
			type: Boolean,
			default: null
		},
		projectPassed: { // 专家审核通过
			type:Boolean,
			default: null
		},
		adminSupport: { // 管理员同意
			type: Boolean,
			default: null
		},
		remittance: { // 已拨款
			type: Boolean,
			default: null
		},
		completed: { // 项目已完成
			type: Boolean,
			default: null
		},
		successful: { // 项目研究是否成功
			type: Boolean,
			default: null
		},
		excellent: { // 优秀项目
			type: Boolean,
			default: null
		}
	},
	useless: { //giveUp: 放弃申请，exceededModifyCount: 超过修改次数， null: 数据有效
		type: String,
		default: null
	},
	disabled: {
		type: Boolean,
		default: false
	},
	submittedReport: {
		type: Boolean,
		default: false
	},
	reportNeedThreads: {
		type: Boolean,
		default: false
	},
	category: {
		type: String,
		default: null,
		index: 1
	},
	lock: {
		submitted: { // 用于判断用户当前申请表是否已提交
			type: Boolean,
			default: false
		},
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
		default: []
	},
	objectorsId: { // 反对的人
		type: [String],
		default: []
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