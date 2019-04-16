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
    default: "",
    index: 1
  },
  // 商品文章的第一条post，存着商品的名称、简介和详细信息
  oc: {
    type: String,
    default: "",
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
  /**
   * 特殊说明
   */
  attentions: {
    type: Array,
    default: []
  },
  // 自定义商品参数(不参与搜索)
  params: {
    type: [],
    default: [],
  },
  // 是否上传凭证
  uploadCert: {
    type: Boolean,
    default: false
  },
  // 凭证说明
  uploadCertDescription: {
    type: String,
    default: ""
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
  // storeId: {
  //   type: String,
  //   required: true
  // },
  /**
   * 库存计数方式
   * @payReduceStock 付款减库存
   * @orderReduceStock 下单减库存
   */
  // 是否免邮
  isFreePost: {
    type: Boolean,
    default: true
  },
  // 运费价格
  freightPrice: {
    type: Schema.Types.Mixed,
    default: {
      firstFreightPrice: null,
      addFreightPrice: null
    }
  },
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
    default: null,
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
   * @param notonshelf 未上架
   * @param insale 销售中
   * @param stopsale 停售中
   */
  productStatus: {
    type: String,
    default: "notonshelf"
  },
  /**
   * 限购数量
   * @param -1 不限购
   */
  purchaseLimitCount: {
    type: Number,
    default: -1
  },
  // 暂不上架和定时上架 临时存文章信息
  threadInfo: {
    type: Schema.Types.Mixed,
    default: ""
  },
  // 错误信息
  error: {
    type: String,
    default: ""
  },
  // 用户购买记录
  // {
  // uid,
  // count
  // }
  buyRecord: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  collection: 'shopGoods'
});


/* 
  拓展商品信息
  @param products: 商品对象组成的数组
  @param o: 
    参数    数据类型(默认值) 介绍
    user:   Boolean(true) 是否拓展商品所属用户
    dealInfo: Boolean(true) 是否拓展商家基础信息
    post:   Boolean(true) 是否拓展商品对应的post, name, description, abstract
    thread: Boolean(true) 是否拓展商品对应的文章
  @reture 拓展后的对象数组，此时的商品对象已不再时schema对象，故无法调取model中定义的方法。
  @author pengxiguaa 2019/3/6
*/
shopGoodsSchema.statics.extendProductsInfo = async (products, o) => {
  if(!o) o = {};
  let options = {
    user: true,
    dealInfo: true,
    post: true,
    thread: true,
    productParam: true
  };
  o = Object.assign(options, o);
  const UserModel = mongoose.model('users');
  const PostModel = mongoose.model('posts');
  const ThreadModel = mongoose.model('threads');
  const ShopDealInfoModel = mongoose.model('shopDealInfo');
  const ShopProductsParamsModel = mongoose.model('shopProductsParams');
  const uid = new Set(), userObj = {};
  const pid = new Set(), postObj = {};
  const tid = new Set(), threadObj = {};
  const productId = new Set(), productParamObj = {};
  const dealInfoObj = {};
  products.map(p => {
    if(o.user)
      uid.add(p.uid);
    if(o.post)  
      pid.add(p.oc);
    if(o.thread)
      tid.add(p.tid);
    if(o.productParam)
      productId.add(p.productId);
  }); 
  let users, posts, threads, dealInfos, productParams;
  if(o.user) {
    users = await UserModel.find({uid: {$in: [...uid]}});
    for(const user of users) {
      userObj[user.uid] = user;
    }
  }
  if(o.dealInfo) {
    dealInfos = await ShopDealInfoModel.find({uid: {$in:[...uid]}});
    for(const dealInfo of dealInfos) {
      dealInfoObj[dealInfo.uid] = dealInfo;
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
      productParams = await ShopProductsParamsModel.extendParamsInfo(productParams)
      productParamObj[productParam] = productParams;
    }
  }
  return await Promise.all(products.map(p => {
    const product = p.toObject();
    if(o.user) product.user = userObj[p.uid];
    if(o.dealInfo) product.dealInfo = dealInfoObj[p.uid];
    if(o.post) {
      const post = postObj[p.oc];
      product.post = post;
      if(post) {
        product.name = post.t;
        product.description = post.c;
        product.abstract = post.abstract;
      } else if(product.threadInfo) {
        product.name = product.threadInfo.title;
        product.description = product.threadInfo.description;
        product.abstract = product.threadInfo.abstract;
      } else {
        product.name = "商品名称丢失";
        product.description = "商品描述丢失";
        product.abstract = "商品简介丢失";
      }
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

/**
 * 检测商品限购
 * @param bills 由账单组成的数组
 * @param uid 购买者的uid
 * @author Kris 2019-3-29
 */
shopGoodsSchema.statics.checkOutPurchaseLimit = async (bills, uid) => {
  const ShopGoodsModel = mongoose.model('shopGoods');
  const ShopOrdersModel = mongoose.model('shopOrders');
  const productId = new Set();
  const countObj = {}, productObj = {};
  // console.log(bills)
  // bills.map(b => {
  //   productId.add(b.productId)
  // });
  // // 在订单中计算每种商品得购买数量
  // let counts = await ShopOrdersModel.aggregate([
  //   {$match: {productId:{$in:[...productId]}, uid}},
  //   {$group: {_id:"$productId", count:{$sum:1}}}
  // ]);
  // for(const count of counts) {
  //   countObj[count._id] = count;
  // }
  // // 取出每种规格的原商品
  // let products = await ShopGoodsModel.find({productId: {$in:[...productId]}});
  // for(const product of products) {
  //   productObj[product.productId] = product;
  // }
  return await Promise.all(bills.map(b => {
    // 已经购买的数量
    let alreadyBuyCount = 0;
    if(b.product.buyRecord[uid]){
      alreadyBuyCount = Number(b.product.buyRecord[uid].count);
    }
    // 商品限购数量
    let limitBuyCount = -1;
    if(b.product.purchaseLimitCount > -1) {
      limitBuyCount = Number(b.product.purchaseLimitCount);
    }
    // 当前帐单购买数量
    let currentBuyCount = Number(b.count);

    let canBuyCount = (limitBuyCount - alreadyBuyCount) - currentBuyCount;

    // 剩余购买数量
    b.remainBuyCount = limitBuyCount - alreadyBuyCount;
    b.canBuy = true;
    if(limitBuyCount != -1 && canBuyCount < 0) {
      b.canBuy = false
    }
    return b;
  }));
};
/**
 * 立即上架函数
 * 定时上架时，可调用
 * @author pengxiguaa 2019/4/2
 */
shopGoodsSchema.methods.onshelf = async function() {
  const {threadInfo, productId, imgMaster, productStatus} = this;
  if(!threadInfo || productStatus === "insale") throwErr(400, "商品已上架，请勿重复提交");
  const ThreadModel = mongoose.model("threads");
  const ResourceModel = mongoose.model("resources");
  const ShopGoodsModel = mongoose.model("shopGoods");
  const tools = require("../tools");
  const settings = require("../settings");
  const thread = await ThreadModel.publishArticle(threadInfo);
  const {tid, oc} = thread;
  await ShopGoodsModel.update({productId}, {$set: {
    tid,
    oc,
    productStatus: "insale",
    threadInfo: ""
  }});
  // 将thread的类型修改为“商品文章”
  // 将商品的主页图片复制裁剪到文章封面图文件夹
  const resource = await ResourceModel.findOne({rid: imgMaster});
  if(resource) {
    const {path} = resource;
    const basePath = settings.mediaPath.selectDiskCharacterDown(resource);
    const imgPath = basePath + path;
    const targetPath = settings.upload.coverPath + '/' + tid + '.jpg';
    await tools.imageMagick.coverify(imgPath, targetPath);
  }
};

const ShopGoodsModel = mongoose.model('shopGoods', shopGoodsSchema);
module.exports = ShopGoodsModel;