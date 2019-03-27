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
  // 退货快递单号
  trackNumber: {
    type: String,
    default: ''
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
  退款接口
  1. 生成科创币记录
  2. 退还kcb
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
  let order = await ShopOrdersModel.findById(orderId);
  const orders = await ShopOrdersModel.userExtendOrdersInfo([order]);
  order = orders[0];
  const description = `${order.count}x${order.product.name}(${order.productParam.name.join('+')})`;
  const {orderStatus, refundStatus, orderPrice} = order;
  if(refundStatus !=="ing" || !["unShip", "unSign"].includes(orderStatus)) throwErr(400, "订单状态已改变，请刷新");
  if(!["S_AGREE_RM", "P_AGREE_RM"].includes(status)) throwErr(400, "退款申请的状态已改变，请刷新");
  const time = Date.now();

  // 买家申请退款的金额(money)和已支付的金额(orderPrice) 分为以下几种情况
  /* 
    1. 申请退款金额小于支付金额 
      orderPrice > money
      a. 退还买家申请退款的金额
      b. 将剩余部分转给卖家
    2. 支付的钱在平台，申请退款的金额等于支付的金额
      orderPrice === money
      a. 退还买家申请退款的金额  
  */ 

  if(orderPrice === money) {
    // 情况2
    const record = KcbsRecordModel({
      _id: await SettingModel.operateSystemID("kcbsRecords", 1),
      from: "bank",
      to: buyerId,
      type: "refund",
      toc: time,
      num: money,
      description,
      ordersId: [orderId]
    }); 
    await record.save();

    await UserModel.update({uid: record.to}, {$inc: {
      kcb: money
    }});

    await SettingModel.update({_id: "kcb"}, {$inc: {
      "c.totalMoney": -1*money
    }})
  } else if(money < orderPrice) {
    // 情况1
    const diff = orderPrice - money;
    const orderToS = KcbsRecordModel({
      _id: await SettingModel.operateSystemID("kcbsRecord", 1),
      from: "bank",
      to: buyerId,
      type: "refund",
      num: money,
      toc: time,
      description,
      ordersId: [orderId]
    });
    const orderToB = KcbsRecordModel({
      _id: await SettingModel.operateSystemID("kcbsRecord", 1),
      from: "bank",
      to: sellerId,
      type: "sell",
      num: diff,
      toc: time,
      description,
      ordersId: [orderId]
    });
    await orderToS.save();
    await orderToB.save();
    await SettingModel.update({_id: "kcb"}, {$inc: {
      "c.totalMoney": -1*orderPrice
    }});
    await UserModel.update({uid: orderToS.to}, {$inc: {
      kcb: orderToS.num
    }});
    await UserModel.update({uid: orderToB.to}, {$inc: {
      kcb: orderToB.num
    }});
  } else {
    throwErr(400, `申请退款的金额不能超过支付订单的金额！orderId=${orderId}`);
  }

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
/**
 * 判断退款申请的状态以及订单状态 状态异常则抛出错误
 * @param String reason: 退款理由或说名
 * @param String operation: 当前执行的操作名
 * @return Object:
 *  reason: (String) 退款理由或说明
 *  time: (Date) 时间
 *  order: (Object) 订单对象
 *  refund: (Object) 退款申请对象
 * @author pengxiguaa 2019/3/27
 */
schema.methods.ensureRefundPermission = async function(reason, operations) {
  const ShopOrdersModel = mongoose.model("shopOrders");
  const ShopRefundModel = mongoose.model("shopRefunds");
  if(!operations) throwErr(400, "operations is required");
  const refund = await ShopRefundModel.findById(this._id);
  const {orderId, status, successed} = refund;
  if(successed !== null) throwErr(400, "申请已完成，无法完成退款操作，请刷新");
  const order = await ShopOrdersModel.findById(orderId);
  const {orderStatus, closeStatus, refundStatus} = order;
  if(closeStatus) throwErr(400, "订单已经被关闭，无法完成退款操作，请刷新");
  if(refundStatus !== "ing") throwErr(400, "订单未处于退款流程，无法完成退款操作，请刷新");
  if(orderStatus === "finish") throwErr(400, "购买已完成，无法完成退款操作，请刷新");
  const time = Date.now();
  if(typeof operations === 'string') {
    if(status !== operations) throwErr(400, `退款申请状态异常，请刷新。refund.status: ${status}, operation: ${operations}`);
  } else {
    if(!operations.includes(status)) throwErr(400, `退款申请状态异常，请刷新。refund.status: ${status}, operations: ${operations}`);
  }
  if(reason) {
    const {contentLength} = require("../tools/checkString");
    if(contentLength(reason) > 1000) ctx.throw(400, "说明的内容不能超过1000个字节");
  }
  return {
    time,
    order,
    refund
  };
}

/**
 * 卖家同意退款申请或超时自动同意
 * @param String reason: 退款理由或说名
 * @authro pengxiguaa 2019/3/27
 */
schema.methods.sellerAgreeRM = async function(reason) {
  const ShopRefundModel = mongoose.model("shopRefunds");
  const {time} = await this.ensureRefundPermission(reason, [
    "B_APPLY_RM", 
    "B_INPUT_INFO"
  ]);
  await ShopRefundModel.update({_id: this._id}, {
    $set: {
      tlm: time,
      status: "S_AGREE_RM"
    },
    $addToSet: {
      logs: {
        status: "S_AGREE_RM",
        time,
        info: reason
      }
    }
  });
  await this.returnMoney();
}

/**
 * 卖家拒绝退款申请
 * @param String reason: 退款理由或说名
 * @author pengxiguaa 2019/3/27
 */
schema.methods.sellerDisagreeRM = async function(reason) {
  if(!reason) throw(400, "拒绝的理由不能为空");
  const ShopRefundModel = mongoose.model("shopRefunds");
  const ShopOrdersModel = mongoose.model("shopOrders");
  const {order, time} = await this.ensureRefundPermission(reason, [
    "B_APPLY_RM",
    "B_INPUT_INFO"
  ]);
  await ShopRefundModel.update({_id: this._id}, {
    $set: {
      tlm: time,
      status: "S_DISAGREE_RM",
      successed: false,
    },
    $addToSet: {
      logs: {
        status: "S_DISAGREE_RM",
        time,
        info: reason
      }
    }
  });
  await ShopOrdersModel.update({orderId: order.orderId}, {
    $set: {
      refundStatus: "fail"
    }
  });
};  

/**
 * 卖家同意退货申请或超时自动同意
 * @param String reason: 退款理由或说名
 * @authro pengxiguaa 2019/3/27
 */
schema.methods.sellerAgreeRP = async function(reason) {
  const ShopRefundModel = mongoose.model("shopRefunds");
  const {time} = await this.ensureRefundPermission(reason, "B_APPLY_RP");
  await ShopRefundModel.update({_id: this._id}, {
    $set: {
      tlm: time,
      status: "S_AGREE_RP"
    },
    $addToSet: {
      logs: {
        status: "S_AGREE_RP",
        time,
        info: reason
      }
    }
  });
}
/**
 * 卖家拒绝退货申请
 * @param String reason: 退款理由或说名
 * @authro pengxiguaa 2019/3/27
 */
schema.methods.sellerDisagreeRP = async function(reason) {
  if(!reason) throw(400, "拒绝的理由不能为空");
  const ShopRefundModel = mongoose.model("shopRefunds");
  const ShopOrdersModel = mongoose.model("shopOrders");
  const {time, order} = await this.ensureRefundPermission(reason, "B_APPLY_RP");
  await ShopRefundModel.update({_id: this._id}, {
    $set: {
      tlm: time,
      status: "S_DISAGREE_RP",
      successed: false
    },
    $addToSet: {
      logs: {
        status: "S_DISAGREE_RP",
        time,
        info: reason
      }
    }
  });
  await ShopOrdersModel.update({orderId: order.orderId}, {
    $set: {
      refundStatus: "fail"
    }
  });
}
/**
 * 买家撤销申请 也可能是因为申请超时系统撤销
 * @param String reason: 撤销的理由或说明
 * @author pengxiguaa 2019/3/27
 */
schema.methods.buyerGiveUp = async function(reason) {
  if(!reason) throw(400, "放弃的理由不能为空");
  const ShopRefundModel = mongoose.model("shopRefunds");
  const ShopOrdersModel = mongoose.model("shopOrders");
  const {time, order} = await this.ensureRefundPermission(reason, [
    // 没有同意退款的操作，因为同意退款后系统会立即触发转账功能。
    "B_APPLY_RM",
    "B_APPLY_RP",
    "S_AGREE_RP",
    "B_INPUT_INFO",
    "P_APPLY_RM",
    "P_APPLY_RP",
    "P_AGREE_RP",
  ]);
  await ShopRefundModel.update({_id: this._id}, {$set: {
    status: "B_GU",
    tlm: time,
    successed: false,
    $addToSet: {
      logs: {
        status: "B_GU",
        time,
        info: reason
      }
    }
  }});
  await ShopOrdersModel.update({orderId: order.orderId}, {
    refundStatus: "fail"
  });
};

schema.methods.insertTrackNumber = async function(number) {
  if(!number) throwErr(400, "快递单号不能为空");
  const {contentLength} = require("../tools/checkString");
  if(contentLength(number) > 300) throwErr(400, "快递单号不能超过500字节");
  const {time} = await this.ensureRefundPermission("", [
    "S_AGREE_RP",
    "P_AGREE_RP"
  ]);
  const ShopRefundModel = mongoose.model("shopRefunds");
  await ShopRefundModel.update({_id: this._id}, {
    $set: {
      status: "B_INPUT_INFO",
      tlm: time,
      trackNumber: number
    },
    $addToSet: {
      logs: {
        status: "B_INPUT_INFO",
        time,
        trackNumber: number
      }
    }
  });
};

module.exports = mongoose.model('shopRefunds', schema);