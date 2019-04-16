/* 
  商品规格
  @author pengxiguaa 2019/2/5
*/
'use strict'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const schema = new Schema({
  // 规格ID
  _id: Number,
  // 商品ID
  productId: {
    type: String,
    required: true,
    index: 1
  },
  uid: {
    type: String,
    required: true,
    index: 1
  },
  // 规格索引 对应着商品中的规格值索引，如：0-1-2、2-1-3
  index: {
    type: String,
    default: '',
    index: 1
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 当前规格总库存量
  stocksTotal: {
    type: Number,
    required: true
  },
  // 当前规格剩余库存量
  stocksSurplus: {
    type: Number,
    required: true
  },
  originPrice: {
    type: Number,
    required: true
  },
  // 商品价格 折扣前
  price: {
    type: Number,
    required: true
  },
  // 是否使用折扣
  useDiscount: {
    type: Boolean,
    default: false,
    index: 1
  }
}, {
  collection: 'shopProductsParams'
});
/* 
  通过id查找产品规格
  @author pengxiguaa 2019/3/7
*/
schema.statics.findById = async (id) => {
  const ShopProductParamMode = mongoose.model('shopProductsParams');
  const productParam = await ShopProductParamMode.findOne({_id: id});
  if(!productParam) throwErr(404, `未找到ID为【${id}】的产品规格`);
  return productParam;
}; 
/* 
  拓展规格信息
  @param params: 规格对象数组
  @param o:
    name: Boolean(default true)是否拓展规格名 如：“黄-16g”
  @author pengxiguaa 2019/3/8
*/
schema.statics.extendParamsInfo = async (params, o) => {
  if(!o) o = {};
  const options = {
    name: true
  };
  o = Object.assign(options, o);
  const productsId = new Set();
  params.map(p => {
    productsId.add(p.productId);
  });
  const products = await mongoose.model('shopGoods').find({productId: {$in: [...productsId]}});
  const productObj = {};
  products.map(p => {
    if(!productObj[p.productId]) productObj[p.productId] = p;
  });
  return await Promise.all(params.map(async p => {
    const param = p.toObject();
    param.product = productObj[p.productId];
    let goodsOptions = {
      user: true,
      store: true,
      post: true,
      thread: true,
      productParam: false
    };
    param.product = (await mongoose.model('shopGoods').extendProductsInfo([param.product], goodsOptions))[0];
    if(o.name) {
      const arr = p.index.split('-');
      let name = [];
      for(let i = 0; i < arr.length; i++) {
        if(param.product.params.length !== 0){
          name.push(param.product.params[i].values[arr[i]]);
        }else{
          name.push("默认规格");
        }
      }
      param.name = name;
    }
    return param;
  }));
};

/**
 * 拓展规格名称
 * @productParams 对象数组
 */
schema.statics.extendParamName = async (productParams) => {
  return productParams;
}

/**
 * 减库存
 * @description 根据订单中的productId取出product，如果符合商品的减库存条件，则根据订单中的paramId及购买数量修改该商品规格中的剩余库存
 * @param {Array} orders 订单数组
 * @param {String = 'payReduceStock' | 'orderReduceStock'} reduceMethod - 减库存的条件
 * @author Kris 2019-4-2
 */
schema.statics.productParamReduceStock = async (orders, reduceMethod) => {
  // 如果不传条件，则默认为付款减库存
  if(!reduceMethod || reduceMethod == ""){
    reduceMethod = "payReduceStock";
  }
  const ShopGoodsModel = mongoose.model('shopGoods');
  const ShopProductParamModel = mongoose.model('shopProductsParams');
  for(const order of orders) {
    for(const param of order.params) {
      // 找出订单所属产品
      const product = await ShopGoodsModel.findOne({productId: param.productId});
      const {stockCostMethod} = product;
      // 找出订单所属规格
      const productParam = await ShopProductParamModel.findOne({_id: param.productParamId});
      // 判断减库存条件
      if(productParam && stockCostMethod == reduceMethod) {
        await productParam.update({$set: {stocksSurplus: (Number(productParam.stocksSurplus) - Number(param.count))}});
      }
    }
  }
}


/**
 * 退款恢复库存
 * @param {Object} refund 退款记录
 * @author Kris 2019-4-2
 */
schema.statics.refundRestoreStock = async (refund) => {
  const ShopOrdersModel = mongoose.model("shopOrders");
  const ShopGoodsModel = mongoose.model("shopGoods");
  const ShopProductParamModel = mongoose.model("shopProductsParams");
  // 根据refund中的orderId找到订单
  const order = await ShopOrdersModel.findOne({orderId: refund.orderId});
  // 根据order中的productId取出product
  // const product = await ShopGoodsModel.findOne({productId: product.productId});
  // 根据订单中的paramId取出productParam
  const productParam = await ShopProductParamModel.findOne({_id: order.paramId});
  // 根据订单中的购买数量恢复规格中的剩余库存
  await productParam.update({$set: {stocksSurplus: (Number(productParam.stocksSurplus) + Number(order.count))}});
}

const ShopProductsParamModel = mongoose.model('shopProductsParams', schema);
module.exports = ShopProductsParamModel;