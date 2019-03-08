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

/**
 * 拓展规格名称
 * @productParams 对象数组
 */
schema.static.extendParamName = async (productParams) => {
  console.log(productParams);
  return productParams;
}
const ShopProductParamMode = mongoose.model('shopProductsParams', schema);
module.exports = ShopProductParamMode;