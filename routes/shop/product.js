const Router = require('koa-router');
const productRouter = new Router();
const { Public, OnlyOperation } = require('../../middlewares/permission');
const { Operations } = require('../../settings/operations');
productRouter
  .get('/:productId', Public(), async (ctx, next) => {
    const { db, params, query } = ctx;
    // 获取商品id，并检查商品是否存在
    const { productId } = params;
    let { paraId } = query;
    const product = await db.ShopGoodsModel.findOnly({ productId });
    if (!product) {
      ctx.throw(400, '商品不存在');
    } else {
      return ctx.redirect(`/t/${product.tid}`);
    }
    await next();
  })
  .put('/:productId/changePara', Public(), async (ctx, next) => {
    const { data, body, db, params } = ctx;
    const { paraId } = body;
    const { productId } = params;
    const productParams = await db.ShopProductsParamModel.findOne({
      _id: paraId,
    });
    if (!productParams) {
      ctx.throw(400, '规格查询失败');
    }
    const product = await db.ShopGoodsModel.findOnly({ productId });
    data.productParams = productParams;
    if (product.vipDiscount && data.user) {
      const gradeId = data.user.grade._id;
      let vipNum = 100;
      for (const v of product.vipDisGroup) {
        if (v.vipLevel === gradeId) {
          vipNum = v.vipNum;
        }
      }
      data.productParams.price = data.productParams.price * (vipNum / 100);
    }
    await next();
  })
  // 商品禁售,权限分配给管理员
  .put(
    '/:productId/banSale',
    OnlyOperation(Operations.banSaleProductParams),
    async (ctx, next) => {
      const { db, body } = ctx;
      const { productId, disabled } = body;
      const product = await db.ShopGoodsModel.findOne({ productId: productId });
      if (product) {
        await product.updateOne({ $set: { adminBan: !!disabled } });
      }
      await next();
    },
  )
  .post(
    '/:productId/top',
    OnlyOperation(Operations.pushGoodsToHome),
    async (ctx, next) => {
      const { params, db } = ctx;
      const { productId } = params;
      const product = await db.ShopGoodsModel.findOnly({ productId });
      const homeSettings = await db.SettingModel.getSettings('home');
      if (homeSettings.shopGoodsId.includes(product.productId)) {
        ctx.throw(400, '商品已经被推动到首页了');
      }
      homeSettings.shopGoodsId.unshift(productId);
      await db.SettingModel.updateOne(
        { _id: 'home' },
        {
          $set: {
            'c.shopGoodsId': homeSettings.shopGoodsId,
          },
        },
      );
      await db.SettingModel.saveSettingsToRedis('home');
      await next();
    },
  )
  .del(
    '/:productId/top',
    OnlyOperation(Operations.pushGoodsToHome),
    async (ctx, next) => {
      const { params, db } = ctx;
      const { productId } = params;
      const product = await db.ShopGoodsModel.findOnly({ productId });
      const homeSettings = await db.SettingModel.getSettings('home');
      if (!homeSettings.shopGoodsId.includes(product.productId)) {
        ctx.throw(400, '商品未被推动到首页');
      }
      homeSettings.shopGoodsId.unshift(productId);
      await db.SettingModel.updateOne(
        { _id: 'home' },
        {
          $pull: {
            'c.shopGoodsId': productId,
          },
        },
      );
      await db.SettingModel.saveSettingsToRedis('home');
      await next();
    },
  );
module.exports = productRouter;
