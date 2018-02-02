const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const fundApplicationHistorySchema = new Schema({
	applicationFormId: Number,
	year: {
		type: String,
		default: null,
		index: 1
	},
	order: {
		type: Number,
		default: null,
		index: 1
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
	status: {
		submitted: { // 判断是否是提交过的申请表，下边的lock.submitted作用是判断申请表当前是否提交。
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
		remittance: { // 已汇款
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
	useless: { //giveUp: 放弃申请，exceededModifyCount: 超过修改次数， null: 数据有效
		type: String,
		default: null,
		index: 1
	},
	disabled: {
		type: Boolean,
		default: false,
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