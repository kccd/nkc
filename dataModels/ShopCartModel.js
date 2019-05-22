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
  productParamId: {
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
schema.statics.extendCartsInfo = async (arr) => {
  const UserModel = mongoose.model('users');
  const ShopGoodsModdel = mongoose.model('shopGoods');
  const ShopProductsParamModel = mongoose.model('shopProductsParams');
  const uid = new Set(), userObj = {}, productId = new Set(), productObj = {};
  const productParamId = new Set(), paramObj = {};
  arr.map(a => {
    uid.add(a.uid);
    productId.add(a.productId);
    productParamId.add(a.productParamId);
  });
  const users = await UserModel.find({uid: {$in: [...uid]}});
  const products = await ShopGoodsModdel.find({productId: {$in: [...productId]}});
  let productParams = await ShopProductsParamModel.find({_id: {$in: [...productParamId]}});
  productParams = await ShopProductsParamModel.extendParamsInfo(productParams, {name: true});
  users.map(u => {
    if(!userObj[u.uid]) userObj[u.uid] = u;
  });
  products.map(p => {
    if(!productObj[p.productId]) productObj[p.productId] = p;
  });
  productParams.map(p => {
    if(!paramObj[p._id]) paramObj[p._id] = p;
  });
  return await Promise.all(arr.map(async a => {
    const result = a.toObject();
    result.user = userObj[a.uid];
    result.product = productObj[a.productId];
    result.product = (await ShopGoodsModdel.extendProductsInfo([result.product], {
      thread: false,
      store: false
    }))[0];
    result.productParam = paramObj[a.productParamId];
    return result;
  }));
};
schema.statics.findById = async (_id) => {
  const ShopCartModel = mongoose.model('shopCarts');
  const cart = await ShopCartModel.findOne({_id});
  if(!cart) throwErr(404, '未找到ID为【${_id}】的购物车收藏记录');
  return cart;
};

/**
 * 获取用户购物车的商品数量
 * @param String/Object uid: 用户ID或者用户对象
 * @return Number 数量
 * @author pengxiguaa 2019/3/28
 */
schema.statics.getProductCount = async (uid) => {
  if(typeof uid === "object") {
    uid = uid.uid;
  }
  const carts = await mongoose.model("shopCarts").aggregate([
    {
      $match: {
        uid
      }
    },
    {
      $group: {
        _id: null,
        count: {
          $sum: "$count"
        }
      }  
    }
  ]);
  return carts.length === 0? 0: carts[0].count;
};

const ShopCartModel = mongoose.model('shopCarts', schema);
module.exports = ShopCartModel;