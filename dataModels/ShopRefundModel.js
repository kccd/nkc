const mongoose = require('../settings/database');
const Schema = mongoose.Schema;
const schema = new Schema({
  _id: Number,
  // 退款方式：money: 只退款, product: 只退货, all: 退款+退货
  type: {
    type: String,
    default: '',
    index: 1
  },
  /* 
    退款状态 
      B : buyer // 买家
      S : seller // 卖家
      RP: return product // 退货
      RM: return money // 退款
      RALL: return all // 退货+退款
      GU: give up // 放弃
      NE: negotiating //协商
      IA: inArbitration // 仲裁
      OV: overrule // 平台驳回申请
      CO: completed // 完成

    B_APPLY_RM: 买家申请退款
    B_APPLY_RP: 买家申请退货
    B_APPLY_RALL: 买家申请退货+退款

    S_AGREE_RM: 卖家同意退款
    S_AGREE_RP: 卖家同意退货
    S_AGREE_RALL: 卖家同意退货+退款

    S_DISAGREE_RM: 卖家同意退款
    S_DISAGREE_RP: 卖家同意退货
    S_DISAGREE_RALL: 卖家同意退货+退款

    P_AGREE_RM: 平台同意退款
    P_AGREE_RP: 平台同意退货
    P_AGREE_RALL: 平台同意退货+退款

    P_DISAGREE_RM: 平台同意退款
    P_DISAGREE_RP: 平台同意退货
    P_DISAGREE_RALL: 平台同意退货+退款

    B_RP: 买家退货中
    B_GU: 买家撤销申请
    NE: 协商中
    IA： 仲裁中
    OV: 驳回
    CO: 完成

  */
  status: {
    type: String,
    required: true,
    index: 1
  },
  // 买家ID
  buyerId: {
    type: String,
    required: true,
    index: 1
  },
  // 卖家ID
  sellerId: {
    type: String,
    required: true,
    index: 1
  },
  // 订单ID
  orderId: {
    type: String,
    required: true,
    index: 1
  },
  // 申请退款的理由
  reason: {
    type: String,
    required: true
  },
  // 拒绝退款的理由
  refuseReason: {
    type: String,
    default: ''
  },
  // 退款是否成功，true: 成功, false: 失败, null: 处理中
  successed: {
    type: Boolean,
    default: null,
    index: 1
  },
  // 买家申请的时间
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 最后一次操作该数据的时间
  tlm: {
    type: Date,
    default: null,
    index: 1
  },
  // 操作记录 主要用于显示 {type: 状态名, time: 操作的时间, info: 额外信息}
  logs: {
    type: [Schema.Types.Mixed],
    default: []
  }
}, {
  collection: 'shopRefunds'
});
schema.statics.findById = async (_id) => {
  const refund = await mongoose.model('shopRefunds').findOne({_id});
  if(!refund) throwErr(404, `未找到ID为【${_id}】的退款申请`);
  return refund;
};
schema.statics.extendLogs = async (refunds, lang) => {
  refunds.map(r => {
    r.logs.map(l => {
      l.description = lang('shopRefundStatus', l.type) || l.type;
    }); 
  });
};
module.exports = mongoose.model('shopRefunds', schema);