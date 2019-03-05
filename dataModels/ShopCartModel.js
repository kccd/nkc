/* 
  购物车记录
  @author pengxiguaa 2019/3/4
*/
'use strict'
const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const schema = new Schema({
  _id: Number,
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  uid: {
    type: String,
    required: true
  },
  // 商品的ID
  productId: {
    type: String,
    index: 1,
    required: true
  },
  count: {
    type: Number,
    default: 1
  },
  // 商品规格ID 
  productParamsId: {
    type: Number,
    required: true,
    index: 1
  }
}, {
  collection: 'shopCarts'
});
/* 
  拓展购物车数据
  @param arr: 购物车数据（数组对象）
  @return 拓展后的购物车数据（数组对象，不再是mongoose的schema对象）
  @author pengxiguaa 2019/3/4
*/
schema.statics.extendCarts = async (arr) => {
  const UserModel = mongoose.model('users');
  const ShopGoodsModdel = mongoose.model('shopGoods');
  const uid = new Set(), userObj = {}, productId = new Set(), productObj = {};
  arr.map(a => {
    uid.add(a.uid);
    productId.add(a.productId);
  });
  const users = await UserModel.find({uid: {$in: [...uid]}});
  const products = await ShopGoodsModdel.find({productId: {$in: [...productId]}});
  users.map(u => {
    if(!userObj[u.uid]) userObj[u.uid] = u;
  });
  products.map(p => {
    if(!productObj[p.productId]) productObj[p.productId] = p;
  });
  return arr.map(a => {
    const result = a.toObject();
    result.user = userObj[a.uid];
    result.product = productObj[a.productId];
    return result;
  });
};
const ShopCartModel = mongoose.model('shopCarts', schema);
module.exports = ShopCartModel;