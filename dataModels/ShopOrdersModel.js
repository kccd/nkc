/* 
  商品订单表
  @author Kris 2019/2/22
*/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const shopOrdersSchema = new Schema({
  // 订单id
  orderId: {
    type: String,
    index: 1,
    required: true
  },
  // 商品id
  // productId: {
  //   type: String,
  //   index: 1
  // },
  // 规格id
  // paramId: {
  //   type: String,
  //   index: 1
  // },
  // 商品规格
  params: {
    type: Array,
    default: []
  },
  // 购买者uid
  buyUid: {
    type: String,
    required: true
  },
  // 贩卖者udi
  sellUid: {
    type: String,
    required: true
  },
  // 数量
  // count: {
  //   type: Number,
  //   default: 1
  // },
  // 订单原始总价
  // orderOriginPrice: {
  //   type: Number
  // },
  // 订单运费
  orderFreightPrice: {
    type: Number,
    default: 0
  },
  // 订单总价格
  orderPrice: {
    type: Number,
    default: 0
  },
  // 收货地址
  receiveAddress: {
    type: String,
    default: ""
  },
  // 收货人姓名
  receiveName: {
    type: String,
    default: ""
  },
  // 收货人电话
  receiveMobile: {
    type: String,
    default: ""
  },
  // 下单时间(订单生成时间)
  orderToc: {
    type: Date,
    default: Date.now
  },
  // 付款时间
  payToc: {
    type: Date,
    default: null
  },
  // 发货时间
  shipToc: {
    type: Date,
    default: null
  },
  // 完成时间
  finishToc: {
    type: Date,
    default: null
  },
  // 取消订单时间
  closeToc: {
    type: Date,
    default: null
  },
  /**
   * 订单状态
   * @待付款 unCost
   * @待发货 unShip
   * @待收货 unSign
   * @订单完成 finish
   */
  orderStatus: {
    type: String,
    default: "unCost"
  },
  // 自动收货的时间
  autoReceiveTime: {
    type: Number,
    default: 0,
    index: 1
  },
  // 异常订单
  error: {
    type: String,
    default: "",
    index: 1
  },
  /**
   * 退款状态
   * @ing 正在退款中
   * @success 退款已成功
   * @fail 退款已失败
   * @null 没有退款行为
   */
  refundStatus: {
    type: String,
    default: null
  },
  /**
   * 订单是否关闭
   */
  closeStatus: {
    type: Boolean,
    default: false
  },
  /**
   * 快递单号
   */
  trackNumber: {
    type: String,
    default: ""
  },
  /**
   * 快递公司简称
   * AUTO为自动匹配
   */
  trackName: {
    type: String,
    default: "AUTO"
  },
  // 用于判断买家是否可以请求平台介入
  applyToPlatform: {
    type: Boolean,
    default: false
  }
}, {
  collection: 'shopOrders',
  toObject: {
    getters: true,
    virtuals: true
  }
});
// 虚拟属性 凭证对象数组
shopOrdersSchema.virtual('certs')
	.get(function() {
		return this._certs;
	})
	.set(function(certs) {
		this._certs = certs;
	});


/**
 * 商家拓展订单信息
 * @param orders 由订单对象组成的数组
 * @param o:
 *  参数            数据类型(默认值)      介绍
 *  user:           Boolean(true)   是否拓展购买者信息
 *  product:        Boolean(true)   是否拓展商品信息
 *  productParams:  Boolean(true)   是否拓展商品规格信息
 * @return 拓展后的对象数组，此时的商品对象已不再是schema对象，故无法调用model中的方法
 * @author Kris 2019-3-15
 */
shopOrdersSchema.statics.storeExtendOrdersInfo = async (orders, o) => {
  if(!o) o = {};
  let options = {
    sellUser: true,
    buyUser: true,
    product: true,
    productParam: true
  };
  o = Object.assign(options, o);
  const UserModel = mongoose.model('users');
  const ShopGoodsModel = mongoose.model('shopGoods');
  const ShopProductsParamsModel = mongoose.model('shopProductsParams');
  const sellUid = new Set(), sellUserObj = {};
  const buyUid = new Set(), buyUserObj = {};
  // const productId = new Set(), productObj = {};
  // const paramId = new Set(), productParamObj = {};
  orders.map(ord =>{
    if(o.sellUser)
      sellUid.add(ord.sellUid);
    if(o.buyUser)
      buyUid.add(ord.buyUid);
    // if(o.product)
    //   productId.add(ord.productId);
    // if(o.productParam)
    //   paramId.add(ord.paramId)
  });
  let sellUsers, buyUsers, products, productParams;
  if(o.sellUser) {
    sellUsers = await UserModel.find({uid: {$in:[...sellUid]}});
    for(const sellUser of sellUsers) {
      sellUserObj[sellUser.uid] = sellUser;
    }
  }
  if(o.buyUser) {
    buyUsers = await UserModel.find({uid: {$in:[...buyUid]}});
    for(const buyUser of buyUsers) {
      buyUserObj[buyUser.uid] = buyUser;
    }
  }
  // if(o.product) {
  //   products = await ShopGoodsModel.find({productId: {$in:[...productId]}});
  //   products = await ShopGoodsModel.extendProductsInfo(products);
  //   for(const product of products) {
  //     productObj[product.productId] = product;
  //   }
  // }
  // if(o.productParam) {
  //   productParams = await ShopProductsParamsModel.find({_id: {$in:[...paramId]}});
  //   productParams = await ShopProductsParamsModel.extendParamsInfo(productParams);
  //   for(const productParam of productParams) {
  //     productParamObj[productParam._id] = productParam
  //   }
  // }
  return await Promise.all(orders.map(ord => {
    const order = ord.toObject();
    if(o.sellUser) order.sellUser = sellUserObj[ord.sellUid];
    if(o.buyUser) order.buyUser = buyUserObj[ord.buyUid];
    // if(o.product) order.product = productObj[ord.productId];
    // if(o.productParam) order.productParam = productParamObj[ord.paramId];
    return order
  }))
};

/**
 * 买家拓展订单信息
 * @param orders 由订单组成的数组
 * @param o:
 *  参数  数据类型(默认值)    介绍
 *  product:Boolean(true)   是否拓展商品信息
 *  productParams:Boolean(true) 是否拓展商品规格信息
 * @return 拓展后，对象已不再是schema对象，故无法调用model中的方法
 */
shopOrdersSchema.statics.userExtendOrdersInfo = async (orders, o) => {
  if(!o) o = {};
  let options = {
    product: false,
    productParam: false,
    sellUser: true,
    buyUser: true
  };
  o = Object.assign(options, o);
  const ShopGoodsModel = mongoose.model("shopGoods");
  const ShopProductsParamsModel = mongoose.model("shopProductsParams");
  const UserModel = mongoose.model("users");
  const productId = new Set(), productObj = {};
  const paramId = new Set(), productParamObj = {};
  const sellUid = new Set(), sellUserObj = {};
  const buyUid = new Set(), buyUserObj = {};
  orders.map(ord => {
    if(o.product)
      productId.add(ord.productId);
    if(o.productParam)
      paramId.add(ord.paramId)
      if(o.sellUser)
        sellUid.add(ord.sellUid)
      if(o.buyUser)
        buyUid.add(ord.buyUid)
  });
  let products, productParams, sellUsers, buyUsers;
  if(o.product) {
    products = await ShopGoodsModel.find({productId: {$in:[...productId]}});
    products = await ShopGoodsModel.extendProductsInfo(products);
    for(const product of products) {
      productObj[product.productId] = product;
    }
  }
  if(o.productParam) {
    productParams = await ShopProductsParamsModel.find({_id: {$in:[...paramId]}});
    productParams = await ShopProductsParamsModel.extendParamsInfo(productParams);
    for(const productParam of productParams) {
      productParamObj[productParam._id] = productParam
    }
  }
  if(o.sellUser) {
    sellUsers = await UserModel.find({uid: {$in: [...sellUid]}});
    for(const sellUser of sellUsers) {
      sellUserObj[sellUser.uid] = sellUser;
    }
  }
  if(o.buyUser) {
    buyUsers = await UserModel.find({uid: {$in: [...buyUid]}});
    for(const buyUser of buyUsers) {
      buyUserObj[buyUser.uid] = buyUser;
    }
  }
  return await Promise.all(orders.map(ord => {
    const order = ord.toObject();
    if(o.product) order.product = productObj[ord.productId];
    if(o.productParam) order.productParam = productParamObj[ord.paramId];
    if(o.sellUser) order.sellUser = sellUserObj[ord.sellUid];
    if(o.buyUser) order.buyUser = buyUserObj[ord.buyUid];
    return order
  }))
};
/* 
  获取多个订单的信息，包括：订单名（多个商品名拼接）、订单介绍、订单价格（总计）、订单ID数组
  @param orders: 订单对象数组
  @return obj: 
    name: 订单名
    description: 订单介绍
    totalMoney: 总价格
    ordersId: 订单ID
  @author pengxiguaa 2019/3/20  
*/
shopOrdersSchema.statics.getOrdersInfo = async (orders) => {
  const ShopOrdersModel = mongoose.model('shopOrders');
  orders = await ShopOrdersModel.storeExtendOrdersInfo(orders);
  let titles = [];
  const ordersId = [];
  let totalMoney = 0;
  for(const o of orders) {
    for(const c of o.params){
      let title = "";
      let needAdd = true;
      if(needAdd) {
        const old = title;
        title += `${c.count}*${c.product.name}(${c.productParam.name.join('+ ')}) `;
        if(title.length >= 150) {
          needAdd = false;
          title = old + '...';
        }
      }
      titles.push(title)
    }
    ordersId.push(o.orderId);
    totalMoney += (o.orderPrice + o.orderFreightPrice);
  }
  return {
    description: titles,
    totalMoney,
    ordersId
  }
};
/* 
  构造查询条件
  @param q: 自定义查询条件
  @return 查询对象
  @author pengxiguaa 2019/3/21
 */
shopOrdersSchema.statics.getQueryData = async (q) => {
  return Object.assign({
    closeStatus: false
  }, q);
};

/* 
  处理超过30分钟未付款的订单
  @param uid: 用户ID
  @author pengxiguaa 2019/3/21
*/
shopOrdersSchema.statics.clearTimeoutOrders = async (uid) => {
  const now = Date.now();
  await mongoose.model('shopOrders').updateMany({
    uid,
    toc: {
      $lt: now - 30 * 60 *1000
    },
    closeStatus: false,
    orderStatus: 'unCost'
  }, {
    $set: {
      closeStatus: true,
      closeToc: now
    }
  });
};

/* 
  翻译订单当前所处的状态，会在订单对象上添加”status“属性，值为订单状态字符串
  @param orders: 订单对象所组成的数组
  @author pengxiguaa 2019/3/21
*/
shopOrdersSchema.statics.translateOrderStatus = async (orders) => {
  return orders.map(o => {
    let order;
    if(o.toObject) {
      order = o.toObject();
    } else {
      order = o;
    }
    const {orderStatus, closeStatus, refundStatus} = order;
    let refund = '';
    if(refundStatus === 'ing') {
      refund = '(退款中)';
    } else if(refundStatus === 'success') {
      refund = '(退款成功)';
    } else if(refundStatus === 'fail') {
      refund = '(退款失败)';
    }
    if(closeStatus) {
      order.status = '已关闭';
    } else {
      switch(orderStatus) {
        case 'unCost': order.status = '待付款'; break;
        case 'unShip': order.status = '待发货'; break;
        case 'unSign': order.status = '待收货'; break;
        case 'finish': order.status = '完成'; break;
      }
      order.status += refund;
    }
    return order;
  });
};

shopOrdersSchema.statics.findById = async (orderId) => {
  const order = await mongoose.model('shopOrders').findOne({orderId});
  if(!order) throwErr(404, `未找到ID为【${orderId}】的订单`);
  return order;
};

/**
 * 确认收货 银行将买家支付的kcb打给卖家
 * @author pengxiguaa 2019/3/27
 */
shopOrdersSchema.methods.confirmReceipt = async function() {
  const UserModel = mongoose.model("users");
  const SettingModel = mongoose.model("settings");
  const KcbsRecordModel = mongoose.model("kcbsRecords");
  const ShopOrdersModel = mongoose.model("shopOrders");
  const {orderId, orderStatus, closeStatus, orderPrice, refundStatus} = this;
  let order = await ShopOrdersModel.findById(orderId);
  const orders = await ShopOrdersModel.userExtendOrdersInfo([order]);
  order = orders[0];
  if(closeStatus) throwErr(400, `订单已被关闭，请刷新`);
  if(orderStatus !== "unSign") throwErr(400, "订单未处于待收货状态，请刷新");
  switch(refundStatus) {
    case "ing": throwErr(400, "订单正处于退款流程，请刷新"); break;
    case "success": throwErr(400, "订单已被关闭，请刷新"); break;
  }
  const time = Date.now();
  const record = KcbsRecordModel({
    _id: await SettingModel.operateSystemID('kcbsRecords', 1),
    from: "bank",
    to: order.product.uid,
    description: `${order.count}x${order.product.name}(${order.productParam.name.join('+')})`,
    type: "sell",
    num: orderPrice,
    toc: time,
    ordersId: [orderId]
  });
  await record.save();
  await ShopOrdersModel.update({orderId}, {$set: {
    orderStatus: "finish",
    finishToc: time
  }});
  await SettingModel.update({_id: 'kcb'}, {$inc: {
    "c.totalMoney": -1 * orderPrice
  }});
  await UserModel.update({uid: order.product.uid}, {$inc: {
    kcb: orderPrice
  }});
};
/**
 * 拓展订单的凭证
 * @param {string} type buyer:只拓展买家上传的凭证，seller: 只拓展卖家上传的凭证，null: 都拓展
 * @return [Object] 凭证对象数组
 * @author pengxiguaa 2019/3/28
 */
shopOrdersSchema.methods.extendCerts = async function(type) {
  const ShopCertModel = mongoose.model("shopCerts");
  const ShopGoodsModel = mongoose.model("shopGoods");
  const {orderId, productId, buyUid} = this;
  const product = await ShopGoodsModel.findById(productId);
  const c = await ShopCertModel.find({orderId, deleted: false}).sort({toc: 1});
  const certs = [];
  for(cert of c) {
    if(type === "buyer") {
      if(cert.uid === buyUid) certs.push(cert);
    } else if(type === "seller") {
      if(cert.uid === product.uid) certs.push(cert);
    } else {
      certs.push(cert);
    }
  }
  return this.certs = certs;
};  
/**
 * 买家取消订单
 * @author pengxiguaa 2019/4/2
 */
shopOrdersSchema.methods.cancelOrder = async function(reason) {
  const {contentLength} = require("../tools/checkString");
  if(reason && contentLength(reason) > 1000) throwErr(400, "理由不能超过1000字节");
  const ShopRefundModel = mongoose.model("shopRefunds");
  const SettingModel = mongoose.model("settings");
  const ShopGoodsModel = mongoose.model("shopGoods");
  const ShopOrdersModel = mongoose.model("shopOrders");
  const product = await ShopGoodsModel.findOnly({productId: this.productId});
  const time = Date.now();
  const refund = ShopRefundModel({
    _id: await SettingModel.operateSystemID("shopRefunds", 1),
    toc: time,
    status: "B_GIVE_UP_ORDER",
    buyerId: this.buyUid,
    sellerId: product.uid,
    orderId: this.orderId,
    logs: [
      {
        status: "B_GIVE_UP_ORDER",
        info: reason,
        time
      }
    ]
  });
  await refund.save();
  await ShopOrdersModel.update({orderId: this.orderId}, {$set: {
    closeToc: time,
    closeStatus: true,
    refundStatus: "success"
  }});
};

/*
* 卖家取消订单
* 若卖家未付款，则填写理由直接取消即可
* 若卖家已付款，则需卖家填写补偿金额并且输入密码填写理由
* @param {Number} money 卖家支付给卖家的补偿款
* @param {String} reason 取消的理由
* @author pengixguaa 2019/4/3
* */
shopOrdersSchema.methods.sellerCancelOrder = async function(reason, money) {
  const {contentLength} = require("../tools/checkString");
  if(reason && contentLength(reason) > 1000) throwErr(400, "理由不能超过1000字节");
  const ShopRefundModel = mongoose.model("shopRefunds");
  const SettingModel = mongoose.model("settings");
  const ShopGoodsModel = mongoose.model("shopGoods");
  const ShopOrdersModel = mongoose.model("shopOrders");
  const UserModel = mongoose.model("users");
  const KcbsRecordModel = mongoose.model("kcbsRecords");
  const product = await ShopGoodsModel.findOnly({productId: this.productId});
  const orders = await ShopOrdersModel.userExtendOrdersInfo([this]);
  const order = orders[0];
  const time = Date.now();
  if(!["unCost", "unShip"].includes(order.orderStatus)) throwErr(400, "卖家仅能取消待付款或待发货的订单");
  if(order.orderStatus === "unShip") {
    if(money >= 100 && money <= 5000) {}
    else throwErr(400, "补偿金额不能小于1科创币且不能大于50科创币");
  }
  const refund = ShopRefundModel({
    _id: await SettingModel.operateSystemID("shopRefunds", 1),
    toc: time,
    status: "S_GIVE_UP_ORDER",
    buyerId: this.buyUid,
    sellerId: product.uid,
    orderId: this.orderId,
    logs: [
      {
        status: "S_GIVE_UP_ORDER",
        info: reason,
        money,
        time
      }
    ]
  });
  await refund.save();
  const description = `${order.count}x${order.product.name}(${order.productParam.name.join('+')})`;
  if(order.orderStatus === "unShip") {
    const refundRecord = KcbsRecordModel({
      _id: await SettingModel.operateSystemID("kcbsRecords", 1),
      from: "bank",
      to: order.buyUid,
      type: "refund",
      num: order.orderPrice,
      description,
      ordersId: [order.orderId]
    });
    const record = KcbsRecordModel({
      _id: await SettingModel.operateSystemID("kcbsRecords", 1),
      from: product.uid,
      to: order.buyUid,
      description,
      type: "sellerCancelOrder",
      num: money,
      ordersId: [order.orderId]
    });
    await ShopOrdersModel.update({orderId: this.orderId}, {$set: {
      closeToc: time,
      closeStatus: true,
      refundStatus: "success"
    }});
    await refundRecord.save();
    await record.save();
    await SettingModel.update({_id: "kcb"}, {
      $inc: {
        "c.totalMoney": -1*order.orderPrice
      }
    });
    await UserModel.update({uid: record.from}, {
      $inc: {
        kcb: -1*record.num
      }
    });
    await UserModel.update({uid: record.to}, {
      $inc: {
        kcb: record.num + order.orderPrice
      }
    });
  }
};

const ShopOrdersModel = mongoose.model('shopOrders', shopOrdersSchema);

module.exports = ShopOrdersModel;