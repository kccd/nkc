/* 
  商品购买表
  @author Kris 2019/4/17
*/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const shopCostRecordSchema = new Schema({
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 购买记录id
  costId: {
    type: String,
    index: 1,
    required: true
  },
  // 订单Id
  orderId: {
    type: String,
    index: 1,
    required: true
  },
  // 商品Id
  productId: {
    type: String,
    index: 1,
    required: true
  },
  // 规格Id
  productParamId: {
    type: Number,
    index: 1,
    required: true
  },
  // 规格对象
  productParam: {
    type: Schema.Types.Mixed,
  },
  // 购买数量
  count: {
    type: Number 
  },
  // 购买者id
  uid: {
    type: String
  },
  // 运费
  freightPrice: {
    type: Number
  },
  // 商品总价 不包含运费
  productPrice: {
    type: Number
  },
  // 商品单价
  singlePrice: {
    type: Number
  }, 
  // 退款状态
  refundStatus: {
    type: String,
    default: ""
  },
  // 退款金额
  refundMoney: {
    type: Number,
    default: 0
  }
}, {
  collection: 'shopCostRecord'
});

/**
 * 订单拓展购买记录
 */
shopCostRecordSchema.statics.orderExtendRecord = async (costRecords, o) => {
  if(!o) o = {};
  let options = {
    product: true,
    user: true
  };
  o = Object.assign(options, o);
  const ShopGoodsModel = mongoose.model("shopGoods");
  const ShopProductsParamsModel = mongoose.model("shopProductsParams");
  const UserModel = mongoose.model("users");
  const productId = new Set(), productObj = {};
  // const paramId = new Set(), productParamObj = {};
  const uid = new Set(), userObj = {};
  costRecords.map(cos => {
    if(o.product)
      productId.add(cos.productId);
    // if(o.productParam)
    //   paramId.add(cos.productParamId)
    if(o.user)
      uid.add(cos.uid)
  });
  let products, productParams, users;
  if(o.product) {
    products = await ShopGoodsModel.find({productId: {$in:[...productId]}});
    products = await ShopGoodsModel.extendProductsInfo(products);
    for(const product of products) {
      productObj[product.productId] = product;
    }
  }
  // if(o.productParam) {
  //   productParams = await ShopProductsParamsModel.find({_id: {$in:[...paramId]}});
  //   productParams = await ShopProductsParamsModel.extendParamsInfo(productParams);
  //   for(const productParam of productParams) {
  //     productParamObj[productParam._id] = productParam
  //   }
  // }
  if(o.user) {
    users = await UserModel.find({uid: {$in: [...uid]}});
    for(const user of users) {
      userObj[user.uid] = user;
    }
  }
  return await Promise.all(costRecords.map(cos => {
    const costRecord = cos.toObject();
    if(o.product) costRecord.product = productObj[cos.productId];
    // if(o.productParam) costRecord.productParam = productParamObj[cos.productParamId];
    if(o.user) costRecord.user = userObj[cos.uid];
    return costRecord
  }))
};

const ShopCostRecordModel = mongoose.model('shopCostRecord', shopCostRecordSchema);
module.exports = ShopCostRecordModel;