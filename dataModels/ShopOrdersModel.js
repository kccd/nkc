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
  // 商铺id
  storeId: {
    type: String,
    index: 1
  },
  // 商品id
  productId: {
    type: String,
    index: 1
  },
  // 规格id
  paramId: {
    type: String,
    index: 1
  },
  // 购买者uid
  uid: {
    type: String,
  },
  // 数量
  count: {
    type: Number,
    default: 1
  },
  // 订单原始总价
  orderOriginPrice: {
    type: Number
  },
  // 订单最终总价格
  orderPrice: {
    type: Number,
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
  // 收货时间
  signToc: {
    type: Date,
    default: null
  },
  // 完成时间
  finish: {
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
  // 是否有退款
  idRefund: {
    type: Boolean,
    default: false
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
  }
}, {
  collection: 'shopOrders'
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
    store: true,
    user: true,
    product: true,
    productParam: true
  };
  o = Object.assign(options, o);
  const ShopOrdersModel = mongoose.model('shopStores');
  const UserModel = mongoose.model('users');
  const ShopGoodsModel = mongoose.model('shopGoods');
  const ShopProductsParamsModel = mongoose.model('shopProductsParams');
  const storeId = new Set(), storeObj = {};
  const uid = new Set(), userObj = {};
  const productId = new Set(), productObj = {};
  const paramId = new Set(), productParamObj = {};
  orders.map(ord =>{
    if(o.store)
      storeId.add(ord.storeId)
    if(o.user)
      uid.add(ord.uid);
    if(o.product)
      productId.add(ord.productId)
    if(o.productParam)
      paramId.add(ord.paramId)
  });
  let stores, users, products, productParams;
  if(o.store) {
    stores = await ShopOrdersModel.find({storeId: {$in:[...storeId]}});
    for(const store of stores) {
      storeObj[store.storeId] = store;
    }
  }
  if(o.user) {
    users = await UserModel.find({uid: {$in:[...uid]}});
    for(const user of users) {
      userObj[user.uid] = user;
    }
  }
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
  return await Promise.all(orders.map(ord => {
    const order = ord.toObject();
    if(o.store) order.store = storeObj[ord.storeId];
    if(o.user) order.user = userObj[ord.uid];
    if(o.product) order.product = productObj[ord.productId];
    if(o.productParam) order.productParam = productParamObj[ord.paramId];
    return order
  }))
}

/**
 * 买家拓展订单信息
 * @param orders 由订单组成的数组
 * @param o:
 *  参数  数据类型(默认值)    介绍
 *  store:    Boolean(true) 是否拓展店铺信息
 *  product:Boolean(true)   是否拓展商品信息
 *  productParams:Boolean(true) 是否拓展商品规格信息
 * @return 拓展后，对象已不再是schema对象，故无法调用model中的方法
 */
shopOrdersSchema.statics.userExtendOrdersInfo = async (orders, o) => {
  if(!o) o = {};
  let options = {
    store: true,
    product: true,
    productParam: true,
  };
  o = Object.assign(options, o);
  const ShopStoresModel = mongoose.model("shopStores");
  const ShopGoodsModel = mongoose.model("shopGoods");
  const ShopProductsParamsModel = mongoose.model("shopProductsParams");
  const storeId = new Set(), storeObj = {};
  const productId = new Set(), productObj = {};
  const paramId = new Set(), productParamObj = {};
  orders.map(ord => {
    if(o.store)
      storeId.add(ord.storeId)
    if(o.product)
      productId.add(ord.productId)
    if(o.productParam)
      paramId.add(ord.paramId)
  });
  let stores, products, productParams;
  if(o.store) {
    stores = await ShopStoresModel.find({storeId: {$in:[...storeId]}});
    for(const store of stores) {
      storeObj[store.storeId] = store;
    }
  }
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
  return await Promise.all(orders.map(ord => {
    const order = ord.toObject();
    if(o.store) order.store = storeObj[ord.storeId];
    if(o.product) order.product = productObj[ord.productId];
    if(o.productParam) order.productParam = productParamObj[ord.paramId];
    return order
  }))
}
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
  let title = '';
  const ordersId = [];
  let totalMoney = 0;
  let needAdd = true;
  for(const o of orders) {
    if(needAdd) {
      const old = title;
      title += `${o.count}*${o.product.name}(${o.productParam.name.join('+ ')}) `;
      if(title.length >= 150) {
        needAdd = false;
        title = old + '...';
      }
    }
    ordersId.push(o.orderId);
    totalMoney += o.orderPrice;
  }
  return {
    title,
    description: title,
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
      refund = '(正在申请退款中)';
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
}

const ShopOrdersModel = mongoose.model('shopOrders', shopOrdersSchema);
module.exports = ShopOrdersModel;