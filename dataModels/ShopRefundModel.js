/**
 * 退款申请
 * @author pengxiguaa 2019/3/28
 */
const mongoose = require('../settings/database');
const Schema = mongoose.Schema;
const schema = new Schema({
  _id: Number,
  // 退款方式：money: 只退款, product: 退款退货
  type: {
    type: String,
    default: '',
    index: 1
  },
  // 卖家信息 退货时用
  sellerInfo: {
    name: {
      type: String,
      default: ""
    },
    address: {
      type: String,
      default: ""
    },
    mobile: {
      type: String,
      default: ""
    }
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
      GU: give up // 放弃
      OV: overrule // 平台驳回申请
      CO: completed // 完成
      RC: receive // 收到

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
  paramId: {
    type: String,
    default: ""
  },
  // 退款是否成功，true: 成功, false: 失败, null: 处理中
  succeed: {
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
  },
  // 自动处理时出错的信息
  error: {
    type: String,
    default: "",
    index: 1
  }
}, {
  collection: 'shopRefunds'
});
schema.pre("save", function(next) {
  if(!this.tlm) {
    this.tlm = this.toc;
  }
  next();
});
schema.statics.findById = async (_id) => {
  const refund = await mongoose.model('shopRefunds').findOne({_id});
  if(!refund) throwErr(404, `未找到ID为【${_id}】的退款申请`);
  return refund;
};

/** 
  * @name extendLogs
  * @description 推展退款申请操作记录,翻译操作类型
  * @param {Array} refunds 退款申请对象数组
  * @param {Object = ctx.state.lang} lang 翻译函数
  * @author pengxiguaa 2019-3-26
  */
schema.statics.extendLogs = async (refunds, lang) => {
  refunds.map(r => {
    r.logs.map(l => {
      l.description = lang("shopRefundStatus", l.status) || l.status;
    }); 
  });
};

/**
 * @name extendLastLog
 * @description 拓展退款申请操作记录，直取最后一条
 * @param {Array} refunds 退款申请对象数组
 * @param {Object = ctx.state.lang} lang 翻译函数
 * @author Kris 2019-4-3
 */
schema.statics.extendLastLog = async (refunds, lang) => {
  refunds.map(r => {
    r.logs.map(l => {
      l.description = lang("shopRefundStatus", l.status) || l.status
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
  const ShopCostRecordModel = mongoose.model("shopCostRecord");
  const UserModel = mongoose.model("users");
  const SettingModel = mongoose.model("settings");
  const refund = await ShopRefundModel.findById(this._id);
  const {_id, money, orderId, status, sellerId, buyerId} = refund;
  if(money >= 0){}
  else{
    throwErr(`退款金额必须大于0， money: ${money}`)
  }
  let order = await ShopOrdersModel.findById(orderId);
  let param;
  if(this.paramId) {
    param = await order.getParamById(this.paramId);
  }
  const orders = await ShopOrdersModel.userExtendOrdersInfo([order]);
  order = orders[0];
  let description = "";
  for(const p of order.params) {
    description += `${p.count}x${p.product.name}x${p.productParam.name}`;
  }
  const {orderStatus, refundStatus, orderPrice, orderFreightPrice} = order;
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
  // 退单个商品的情况
  if(param) {
    const record = KcbsRecordModel({
      _id: await SettingModel.operateSystemID("kcbsRecords", 1),
      from: "bank",
      to: buyerId,
      type: "refund",
      toc: time,
      num: money,
      description: param.product.name,
      ordersId: [orderId]
    });
    await record.save();
    await UserModel.updateUserKcb(record.to);
  } else if(orderPrice === money) {
    // 情况2
    // 将商品退款金额打给买家
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
    await UserModel.updateUserKcb(record.to);
    // 将运费打给卖家
    const recordSeller = KcbsRecordModel({
      _id: await SettingModel.operateSystemID("kcbsRecords", 1),
      from: "bank",
      to: sellerId,
      type: "refund",
      toc: time,
      num: orderFreightPrice,
      description,
      ordersId: [orderId]
    })
    await recordSeller.save();
    await UserModel.updateUserKcb(recordSeller.to);
  } else if(money < orderPrice) {
    // 情况1
    const diff = (orderPrice+orderFreightPrice) - money;
    const orderToS = KcbsRecordModel({
      _id: await SettingModel.operateSystemID("kcbsRecords", 1),
      from: "bank",
      to: buyerId,
      type: "refund",
      num: money,
      toc: time,
      description,
      ordersId: [orderId]
    });
    const orderToB = KcbsRecordModel({
      _id: await SettingModel.operateSystemID("kcbsRecords", 1),
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
    await UserModel.updateUserKcb(buyerId);
    await UserModel.updateUserKcb(sellerId);
  } else {
    throwErr(400, `申请退款的金额不能超过支付订单的金额！orderId=${orderId}`);
  }

  await ShopRefundModel.updateMany({_id}, {
    $set: {
      status: "RM_CO",
      succeed: true,
      tlm: time
    }, 
    $addToSet: {
      logs: {
        status: "RM_CO",
        time,
      }
    }
  });
  if(param) {
    // 退单一商品

    // 将订单的状态改为正常 并从订单总金额中减去退掉的商品的总价
    await ShopOrdersModel.update({orderId: orderId}, {
      $set: {
        refundStatus: ""
      },
      $inc: {
        orderPrice: -1*money,
        refundMoney: money
      }
    });
    // 将单一商品的状态改为退款成功
    await ShopCostRecordModel.update({costId: param.costId}, {
      $set: {
        refundStatus: "success",
        refundMoney: money
      }
    });
  } else {
    // 退全部

    // 将订单的状态改为关闭
    await ShopOrdersModel.update({orderId: orderId}, {
      $set: {
        refundStatus: "success",
        closeStatus: true,
        closeToc: time
      },
      $inc: {
        refundMoney: money
      }
    });
    // 将全部商品的状态改为退款完成
    await ShopCostRecordModel.updateMany({orderId: orderId}, {
      $set: {
        refundStatus: "success"
      }
    });
  }
};
/**
 * 判断退款申请的状态以及订单状态 状态异常则抛出错误
 * @param {String} reason: 退款理由或说名
 * @param {String} operations: 当前执行的操作名
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
  const {orderId, status, succeed} = refund;
  if(succeed !== null) throwErr(400, "申请已完成，无法完成退款操作，请刷新");
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
};

/**
 * 平台同意退款申请、同意退货申请或超时自动同意
 */
schema.methods.platformAgreeRM = async function() {
  const ShopRefundModel = mongoose.model("shopRefunds");
  const {time} = await this.ensureRefundPermission("", "P_APPLY_RM");
  await ShopRefundModel.update({_id: this._id}, {
    $set: {
      tlm: time,
      status: "P_AGREE_RM"
    },
    $addToSet: {
      logs: {
        status: "P_AGREE_RM",
        time
      }
    }
  });
  await this.returnMoney();
  await mongoose.model("messages").sendShopMessage({
    type: "shopSellerRefundChange",
    r: this.sellerId,
    orderId: this.orderId,
    refundId: this._id
  });
  await mongoose.model("messages").sendShopMessage({
    type: "shopBuyerRefundChange",
    r: this.buyerId,
    orderId: this.orderId,
    refundId: this._id
  })
};

/**
 * 卖家同意退款申请或超时自动同意
 * @param {String} reason: 退款理由或说明
 * @authro pengxiguaa 2019/3/27
 */
schema.methods.sellerAgreeRM = async function(reason) {
  const ShopRefundModel = mongoose.model("shopRefunds");
  const ShopCostRecordModel = mongoose.model("shopCostRecord");
  const ShopProductsParamModel = mongoose.model("shopProductsParams");
  const {time} = await this.ensureRefundPermission(reason, [
    "B_APPLY_RM", 
    "B_APPLY_RP",
    "B_INPUT_INFO",
    "B_INPUT_CERT_RM"
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
  await mongoose.model("messages").sendShopMessage({
    type: "shopBuyerRefundChange",
    r: this.buyerId,
    orderId: this.orderId,
    refundId: this._id
  });
  // 恢复库存
  const costRecord = await ShopCostRecordModel.findOne({orderId: this.orderId});
  const productParam = await ShopProductsParamModel.findOne({_id: costRecord.productParamId});
  let newPlus = productParam.stocksSurplus + costRecord.count;
  await productParam.update({$set: {stocksSurplus: newPlus}})
};

/**
 * 卖家拒绝退款申请
 * @param {String} reason: 退款理由或说名
 * @author pengxiguaa 2019/3/27
 */
schema.methods.sellerDisagreeRM = async function(reason) {
  if(!reason) throwErr(400, "拒绝的理由不能为空");
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
      succeed: false,
    },
    $addToSet: {
      logs: {
        status: "S_DISAGREE_RM",
        time,
        info: reason
      }
    }
  });

  await this.refundFail();

  await ShopOrdersModel.update({orderId: order.orderId}, {
    $set: {
      applyToPlatform: true
    }
  });

  await mongoose.model("messages").sendShopMessage({
    type: "shopBuyerRefundChange",
    r: this.buyerId,
    orderId: this.orderId,
    refundId: this._id
  });
};  

/**
 * 卖家同意退货申请或超时自动同意
 * @param {String} reason: 退款理由或说名
 * @param {Object} sellerInfo: 卖家信息
 *  name: 收件人姓名
 *  address: 收件人地址
 *  mobile: 收件人手机号
 * @authro pengxiguaa 2019/3/27
 */
schema.methods.sellerAgreeRP = async function(reason, sellerInfo) {
  if(!sellerInfo) {
    const UsersModel = mongoose.model("users");
    const sellUser = await UsersModel.findOne({uid: this.sellerId});
    if(!sellUser) throwErr(404, "用户未开设店铺");
    sellerInfo = {
      name: sellUser.username,
      address: address,
      mobile: mobile[0]
    };
  }
  
  const ShopRefundModel = mongoose.model("shopRefunds");
  const {time} = await this.ensureRefundPermission(reason, [
    "B_APPLY_RP"
  ]);
  await ShopRefundModel.update({_id: this._id}, {
    $set: {
      sellerInfo,
      tlm: time,
      status: "S_AGREE_RP"
    },
    $addToSet: {
      logs: {
        status: "S_AGREE_RP",
        time,
        info: reason,
        sellerInfo
      }
    }
  });
  await mongoose.model("messages").sendShopMessage({
    type: "shopBuyerRefundChange",
    r: this.buyerId,
    orderId: this.orderId,
    refundId: this._id
  });
};

/**
 * 平台拒绝退款申请、退货申请
 */
schema.methods.platformDisagreeRM = async function(reason) {
  if(!reason) throwErr(400, "拒绝理由不能为空");
  const ShopRefundModel = mongoose.model("shopRefunds");
  const {time, order} = await this.ensureRefundPermission(reason, "P_APPLY_RM");
  await ShopRefundModel.update({_id: this._id}, {
    $set: {
      tlm: time,
      status: "P_DISAGREE_RM",
      succeed: false
    },
    $addToSet: {
      logs: {
        status: "P_DISAGREE_RM",
        time,
        info: reason
      }
    }
  });
  await this.refundFail();
  await mongoose.model("messages").sendShopMessage({
    type: "shopBuyerRefundChange",
    r: this.buyerId,
    orderId: this.orderId,
    refundId: this._id
  });
  await mongoose.model("messages").sendShopMessage({
    type: "shopSellerRefundChange",
    r: this.sellerId,
    orderId: this.orderId,
    refundId: this._id
  })
};


/**
 * 卖家拒绝退货申请
 * @param {String} reason: 退款理由或说名
 * @authro pengxiguaa 2019/3/27
 */
schema.methods.sellerDisagreeRP = async function(reason) {
  if(!reason) throwErr(400, "拒绝的理由不能为空");
  const ShopRefundModel = mongoose.model("shopRefunds");

  const {time} = await this.ensureRefundPermission(reason, "B_APPLY_RP");
  await ShopRefundModel.update({_id: this._id}, {
    $set: {
      tlm: time,
      status: "S_DISAGREE_RP",
      succeed: false
    },
    $addToSet: {
      logs: {
        status: "S_DISAGREE_RP",
        time,
        info: reason
      }
    }
  });
  await this.refundFail();
  await mongoose.model("messages").sendShopMessage({
    type: "shopBuyerRefundChange",
    r: this.buyerId,
    orderId: this.orderId,
    refundId: this._id
  });
};
/**
 * 买家撤销申请 也可能是因为申请超时系统撤销
 * @param {String} reason: 撤销的理由或说明
 * @author pengxiguaa 2019/3/27
 */
schema.methods.buyerGiveUp = async function(reason) {
  if(!reason) throwErr(400, "放弃的理由不能为空");
  const ShopRefundModel = mongoose.model("shopRefunds");
  const {time} = await this.ensureRefundPermission(reason, [
    // 没有同意退款的操作，因为同意退款后系统会立即触发转账功能。
    "B_APPLY_RM",
    "B_APPLY_RP",
    "S_AGREE_RP",
    "B_INPUT_INFO",
    "P_APPLY_RM",
    "P_APPLY_RP",
    "P_AGREE_RP",
    "B_INPUT_CERT_RM"
  ]);
  await ShopRefundModel.update({_id: this._id}, {
    $set: {
      status: "B_GU",
      tlm: time,
      succeed: false
    },
    $addToSet: {
      logs: {
        status: "B_GU",
        time,
        info: reason
      }
    }
  });
  await this.refundFail();
  await mongoose.model("messages").sendShopMessage({
    type: "shopSellerRefundChange",
    r: this.sellerId,
    orderId: this.orderId,
    refundId: this._id
  })
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
  await mongoose.model("messages").sendShopMessage({
    type: "shopSellerRefundChange",
    r: this.sellerId,
    orderId: this.orderId,
    refundId: this._id
  })
};
/*
* 退款申请被关闭或被驳回
* 更新order的状态， 若是退全部商品则将refundStatus改为fail
* 更新order上的商品的状态，将"ing"改为""
* @author pengxiguaa 2019-4-18
* * */
schema.methods.refundFail = async function() {
  const {paramId, orderId} = this;
  const ShopOrdersModel = mongoose.model("shopOrders");
  const ShopCostRecordModel = mongoose.model("shopCostRecord");
  const order = await ShopOrdersModel.findById(orderId);
  if(paramId) {
    const param = await ShopCostRecordModel.findOne({costId: paramId});
    if(!param) throwErr(404, `订单${orderId}上未发现规格ID为${paramId}的商品`);
    await order.update({
      $set: {
        refundStatus: ""
      },
      $inc: {
        autoReceiveTime: Date.now() - this.toc
      }
    });
    await param.update({
      $set: {
        refundStatus: ""
      }
    });
  } else {
    await order.update({
      $set: {
        refundStatus: "fail"
      },
      $inc: {
        autoReceiveTime: Date.now() - this.toc
      }
    });
    await ShopCostRecordModel.updateMany({
      orderId,
      refundStatus: "ing"
    }, {
      $set: {
        refundStatus: ""
      }
    });
  }
};

module.exports = mongoose.model('shopRefunds', schema);