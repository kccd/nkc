/* 
  商品数据表
  @author Kris 2019/2/18
*/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const shopGoodsSchema = new Schema({
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 商品id
  productId: {
    type: String,
    index: 1,
    required: true
  },
  // 商品对应的文章
  tid: {
    type: String,
    required: true,
    index: 1
  },
  // 商品文章的第一条post，存着商品的名称、简介和详细信息
  oc: {
    type: String,
    required: true,
    index: 1
  },
  // 新建商品时的ip
  ip: {
    type: String,
    default: '0.0.0.0'
  },
  // 店内分类
  storeClasses: {
    type: [String],
    default: [],
    index: 1
  },
  // 所著专业
  mainForumsId: {
    type: [String],
    index: 1,
    required: true
  },
  // 是否屏蔽
  disabled: {
    type: Boolean,
    default: false,
    index: 1
  },
  // 是能在商品列表中显示
  // 不影响通过url访问
  display: {
    type: Boolean,
    default: true,
    index: 1
  },
  // 用户id
  uid: {
    type: String,
    required: true,
    index: 1
  },/* 
  // 商品名称
  productName: {
    type: String,
    required: true
  },
  // 商品简单介绍
  productDescription: {
    type: String,
    default: ''
  },
  // 商品详情介绍
  productDetails: {
    type: String,
    default: ''
  }, */
  // 自定义商品参数(不参与搜索)
  params: {
    type: [],
    required: true
  },
  //商品介绍图
  imgIntroductions:{
    type: Array,
    default: [String]
  },
  // 商品主图
  imgMaster: {
    type: String,
    required: true
  },
  // 商铺id
  storeId: {
    type: String,
    required: true
  },
  /**
   * 库存计数方式
   * @payReduceStock 付款减库存
   * @orderReduceStock 下单减库存
   */
  stockCostMethod: {
    type: String,
    default: "payReduceStock"
  },
  // 总评价数量
  evalTotalCount: {
    type: Number,
    default: 0
  },
  // 上架时间
  shelfTime: {
    type: Date,
    default: Date.now,
    index: 1
  },
  // 下架时间
  removalTime: {
    type: Date,
    default: Date.now,
    index: 1
  },
  /**
   * 商品状态
   * @notonshelf 未上架
   * @offshelf 已下架
   * @insale 销售中
   * @soldout 已售空
   */
  productStatus: {
    type: String,
    default: "notonshelf"
  },
  /**
   * 付款方式
   * @param kcb 只用科创币支付
   * @param rmb 只用人民币支付
   * @param or 科创币与人民币混合付款
   */
  payMethod: {
    type: String,
    default: 'kcb'
  },
}, {
  collection: 'shopGoods'
});


/* 
  拓展商品信息
  @param products: 商品对象组成的数组
  @param o: 
    参数    数据类型(默认值) 介绍
    user:   Boolean(true) 是否拓展商品所属用户
    store:  Boolean(true) 是否拓展商品所属店铺
    post:   Boolean(true) 是否拓展商品对应的post, name, description, abstract
    thread: Boolean(true) 是否拓展商品对应的文章
  @reture 拓展后的对象数组，此时的商品对象已不再时schema对象，故无法调取model中定义的方法。
  @author pengxiguaa 2019/3/6
*/
shopGoodsSchema.statics.extendProductsInfo = async (products, o) => {
  if(!o) o = {};
  let options = {
    user: true,
    store: true,
    post: true,
    thread: true,
    productParam: true
  };
  o = Object.assign(options, o);
  const UserModel = mongoose.model('users');
  const PostModel = mongoose.model('posts');
  const ThreadModel = mongoose.model('threads');
  const ShopStoresModel = mongoose.model('shopStores');
  const ShopProductsParamsModel = mongoose.model('shopProductsParams');
  const uid = new Set(), userObj = {};
  const pid = new Set(), postObj = {};
  const tid = new Set(), threadObj = {};
  const storesId = new Set(), storeObj = {};
  const productId = new Set(), productParamObj = {};
  products.map(p => {
    if(o.user)
      uid.add(p.uid);
    if(o.store)  
      storesId.add(p.storeId);
    if(o.post)  
      pid.add(p.oc);
    if(o.thread)
      tid.add(p.tid);
    if(o.productParam)
      productId.add(p.productId);
  }); 
  let users, stores, posts, threads, productParams;
  if(o.user) {
    users = await UserModel.find({uid: {$in: [...uid]}});
    for(const user of users) {
      userObj[user.uid] = user;
    }
  }
  if(o.store) {
    stores = await ShopStoresModel.find({storeId: {$in: [...storesId]}});
    for(const store of stores) {
      storeObj[store.storeId] = store;
    }
  }
  if(o.thread) {
    threads = await ThreadModel.find({tid: {$in: [...tid]}});
    for(const thread of threads) {
      threadObj[thread.tid] = thread;
    }
  }
  if(o.post) {
    posts = await PostModel.find({pid: {$in: [...pid]}});
    for(const post of posts) {
      postObj[post.pid] = post;
    }
  }
  if(o.productParam) {
    for(const productParam of productId) {
      productParams = await ShopProductsParamsModel.find({productId: productParam});
      productParamObj[productParam] = productParams;
    }
  }
  return await Promise.all(products.map(p => {
    const product = p.toObject();
    if(o.user) product.user = userObj[p.uid];
    if(o.store) product.store = storeObj[p.storeId];
    if(o.post) {
      const post = postObj[p.oc];
      product.post = post;
      product.name = post.t;
      product.description = post.c;
      product.abstract = post.abstract;
    }
    if(o.thread) product.thread = threadObj[p.tid];
    if(o.productParam) product.productParams = productParamObj[p.productId];
    return product;
  }));
};
shopGoodsSchema.methods.ensurePermission = async function() {
  if(this.disabled) throwErr(403, `商品已被屏蔽，暂无法浏览、收藏、添加到购物车和或购买`);
};
/* 
  通过id查询商品
  @author pengxiguaa 2019/3/7
*/
shopGoodsSchema.statics.findById = async (id) => {
  const ShopGoodsModel = mongoose.model('shopGoods');
  const product = await ShopGoodsModel.findOne({productId: id});
  if(!product) throwErr(404, `为找到ID为【${id}】的商品`);
  return product;
};
const ShopGoodsModel = mongoose.model('shopGoods', shopGoodsSchema);
module.exports = ShopGoodsModel;