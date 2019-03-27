const mongoose = require('../settings/database');
const Schema = mongoose.Schema;
const schema = new Schema({
  _id: Number,
  // 退款方式：money: 只退款, all: 退款+退货
  type: {
    type: String,
    default: '',
    index: 1
  },
  // 退款金额
  money: {
    type: Number,
    default: 0
  },
  // root=true 只能由平台更改状态 仲裁模式
  root: {
    type: Boolean,
    default: false,
    index: 1
  },
  /* 
    退款状态 
      B : buyer // 买家
      S : seller // 卖家
      M: money
      P: product
      RP: return product // 退货
      RM: return money // 退款
      RALL: return all // 退货+退款
      GU: give up // 放弃
      NE: negotiating //协商
      IA: inArbitration // 仲裁
      OV: overrule // 平台驳回申请
      CO: completed // 完成
      RC: receive // 收到

    "B_APPLY_RM": "买家申请退款，等待卖家批准",
    "B_APPLY_RALL": "买家申请退款+退货，等待卖家批准",

    "S_AGREE_RM": "卖家同意退款，等待系统退款",
    "S_AGREE_RALL": "卖家同意退款+退货，等待买家填写物流信息",

    "S_DISAGREE_RM": "卖家拒绝了退款申请，申请已被关闭",
    "S_DISAGREE_RALL": "卖家拒绝了退款+退货申请，申请已被关闭",

    "S_RC_P_SUCCESS": "买家退货完成，等待系统退款",
    "S_RC_P_FAIL": "快递异常或货物异常，卖家拒绝退款，申请已被关闭",

    "P_APPLY_RM": "买家申请退款，等待平台批准",
    "P_APPLY_RALL": "买家申请退款+退货，等待平台批准",

    "P_AGREE_RM": "平台同意退款，等待系统退款",
    "P_AGREE_RALL": "平台同意退款+退货，等待买家填写物流信息",

    "P_DISAGREE_RM": "平台拒绝了退款申请，申请已被关闭",
    "P_DISAGREE_RALL": "平台拒绝了退款+退货申请，申请已被关闭",

    "CO": "订单取消成功",
    
    "RM_CO": "系统退款完成，订单已被关闭",

    "B_GU": "买家撤销了申请，申请已被关闭"

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

/* 
* 推展退款申请操作记录 翻译操作类型
* @param refunds: 退款申请对象数组
  @param lang: ctx.state.lang 翻译函数
  @author pengxiguaa 2019/3/26
*/
schema.statics.extendLogs = async (refunds, lang) => {
  refunds.map(r => {
    r.logs.map(l => {
      l.description = lang("shopRefundStatus", l.status) || l.status;
    }); 
  });
};
/* 
  商城 退款
  1. 生成科创币记录
  2. 从银行转账到用户
  3. 更改申请的状态
  4. 更改订单的状态
  @author pengxiguaa 2019/3/26
*/
schema.methods.returnMoney = async function () {
  const ShopOrdersModel = mongoose.model("shopOrders");
  const ShopRefundModel = mongoose.model('shopRefunds');
  const KcbsRecordModel = mongoose.model("kcbsRecords");
  const UserModel = mongoose.model("users");
  const SettingModel = mongoose.model("settings");
  const refund = await ShopRefundModel.findById(this._id);
  const {_id, money, orderId, status, sellerId, buyerId} = refund;
  if(money > 0){}
  else{
    throwErr(`退款金额必须大于0， money: ${money}`)
  }
  const order = await ShopOrdersModel.findById(orderId);
  const {orderStatus, refundStatus, orderPrice} = order;
  if(refundStatus !=="ing" || !["unShip", "unSign", "finish"].includes(orderStatus)) throwErr(400, "订单状态已改变，请刷新");
  if(!["S_AGREE_RM", "P_AGREE_RM", "S_RC_P_SUCCESS"].includes(status)) throwErr(400, "退款申请的状态已改变，请刷新");
  const time = Date.now();

  // 根据买家所支付的钱(orderPrice)的所在位置(orderStatus) 以及买家申请退款的金额(money) 分为以下几种情况
  /* 
    1. 支付的钱在平台，申请退款金额小于支付金额 
      orderStatus: unShip, unSign; 
      orderPrice > money
      a. 退还买家申请退款的金额
      b. 将剩余部分转给卖家
    2. 支付的钱在平台，申请退款金额大于支付金额
      orderStatus: unShip, unSign; 
      orderPrice < money
      a. 将买家支付的钱全部返回给买家
      b. 卖家同意退款时需输入支付密码以支付超出已支付的部分
    3. 支付的钱在平台，申请退款的金额等于支付的金额
      orderStatus: unShip, unSign; 
      orderPrice === money
      a. 退还买家申请退款的金额  
    4. 支付的钱在卖家
      orderStatus: finish; 
      a. 卖家退还买家申请退款的金额（可能与买家支付的钱不相等）
  */ 

  if(orderStatus === "finish") {
    // 情况4
    const record = KcbsRecordModel({
      _id: await SettingModel.operateSystemID('kcbsRecords', 1),
      from: sellerId,
      to: buyerId,
      type: "refund",
      toc: time,
      num: money,
      ordersId: [orderId]
    });
    await record.save();

    await UserModel.update({uid: record.to}, {$inc: {
      kcb: money
    }});

    await UserModel.update({uid: record.from}, {$inc: {
      kcb: -1*money
    }});
  } else if(orderPrice === money) {
    // 情况3
    const record = KcbsRecordModel({
      _id: await SettingModel.operateSystemID('kcbsRecords', 1),
      from: "bank",
      to: buyerId,
      type: "refund",
      toc: time,
      num: money,
      ordersId: [orderId]
    });
    await record.save();

    await UserModel.update({uid: record.to}, {$inc: {
      kcb: money
    }});

    await SettingModel.update({_id: "kcb"}, {$inc: {
      "c.totalMoney": -1*money
    }})
  } else if(orderPrice < money) {
    const recordSTU = KcbsRecordModel({
      _id: await SettingModel.operateSystemID("kcbsRecords", 1),
      from: "bank",
      to: buyerId,
      type: "refund",
      toc: time,
      num: orderPrice,
      ordersId: [orderId]
    });
    const recordUTU = KcbsRecordModel
  }



  const record = KcbsRecordModel({
    _id: await SettingModel.operateSystemID("kcbsRecords", 1),
    toc: time,
    from: "bank",
    to: order.uid,
    type: "refund",
    num: money,
    ordersId: [orderId]
  });
  await UserModel.update({uid: record.to}, {$inc: {
    kcb: money
  }});
  await SettingModel.update({_id: "kcb"}, {$inc: {
    "c.totalMoney": -1*money
  }});
  await record.save();
  await ShopRefundModel.updateMany({_id}, {
    $set: {
      status: "RM_CO",
      successed: true,
      tlm: time
    }, 
    $addToSet: {
      logs: {
        status: "RM_CO",
        time,
      }
    }
  });
  await ShopOrdersModel.update({orderId: orderId}, {
    $set: {
      refundStatus: "success",
      closeStatus: true,
      closeToc: time
    }
  });
}
module.exports = mongoose.model('shopRefunds', schema);