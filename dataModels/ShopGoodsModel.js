/* 
  商品数据表
  @author Kris 2019/2/18
*/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const shopGoodsSchema = new Schema({
  // 商品id
  productId: {
    type: String,
    index: 1,
    required: true
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
  },
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
  },
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
  }
}, {
  collection: 'shopGoods'
});

// 新建商品之后生成文章
shopGoodsSchema.post('save', async function(product) {
  const ForumModel = mongoose.model('forums');
  const UserModel = mongoose.model('users');
  const ResourceModel = mongoose.model('resources');
  const mediaPath = require('../settings/mediaPath');
  const upload = require('../settings/upload');
  const imageMagick = require('../tools/imageMagick');
  const {mainForumsId, productName, uid, productDescription, ip, imgMaster} = product;
  const user = await UserModel.findOnly({uid});
  await user.extendGeneralSettings();
  const forum = await ForumModel.findOnly({fid: mainForumsId[0]});
  const post = {
    t: productName,
    c: productDescription,
    l: 'html'
  };
  const post_ = await forum.newPost(post, user, ip, [], '', mainForumsId);
  const {tid} = post_;
  const resource = await ResourceModel.findOne({rid: imgMaster});
  if(!resource) throwErr(404, `生成文章封面图失败，未找到ID为【${imgMaster}】的资源图片`);
  const {path} = resource;
  const basePath = mediaPath.selectDiskCharacterDown(resource);
  const imgPath = basePath + path;
  console.log(imgPath);
  const targetPath = upload.coverPath + '/' + tid + '.jpg';
  console.log(targetPath);
  await imageMagick.coverify(imgPath, targetPath);
  // await forum.newPost(post, user, ip, cids, mid, fids);
});
const ShopGoodsModel = mongoose.model('shopGoods', shopGoodsSchema);
module.exports = ShopGoodsModel;