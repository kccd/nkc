const Router = require('koa-router');
const pathModule = require('path');
const router = new Router();
const {
  OnlyUnbannedUser,
  OnlyUser,
} = require('../../../middlewares/permission');
router
  .get('/:_id', OnlyUser(), async (ctx, next) => {
    const { settings, db, data, params, query } = ctx;
    let { type } = query;
    const { _id } = params;
    const { user } = data;
    const cert = await db.ShopCertModel.findOne({ _id, deleted: false });
    if (!cert) {
      ctx.throw(404, `未找到ID为【${_id}】的凭证资源`);
    }
    /* const order = await db.ShopOrdersModel.findOne({orderId: cert.orderId});
    if(!order) ctx.throw(404, `未找到ID为【${cert.orderId}】的订单`);
    const product = await db.ShopGoodsModel.findOne({productId: order.productId});
    if(!order) ctx.throw(404, `未找到ID为【${cert.orderId}】的商品`); */

    if (!ctx.permission('getAnyBodyShopCert')) {
      if (cert.uid !== user.uid) {
        if (
          cert.type !== 'shopping' ||
          !(await db.ShopOrdersModel.findOne({
            sellUid: user.uid,
            orderId: cert.orderId,
          }))
        ) {
          ctx.throw(403, '您没有权限查看别人的凭证');
        }
      }
    }

    const { ext, name, path } = cert;
    type = type === 'sm' && ext === 'jpg' ? '_sm' : '';
    ctx.filePath =
      settings.upload.shopCertsPath + path + _id + type + '.' + ext;
    ctx.fileName = name;
    ctx.set('Content-Type', 'image/jpg');
    await next();
  })
  .del('/:_id', OnlyUnbannedUser(), async (ctx, next) => {
    const { params, data, db } = ctx;
    const { _id } = params;
    const { user } = data;
    const cert = await db.ShopCertModel.findOne({ _id, deleted: false });
    if (!cert) {
      ctx.throw(404, `未找到ID为【${_id}】的凭证资源`);
    }
    if (user.uid !== cert.uid) {
      ctx.throw(403, '您没有权限删除别人的凭证');
    }
    if (!cert.deletable) {
      ctx.throw(400, '已提交的凭证无法删除');
    }
    await db.ShopCertModel.updateOne({ _id }, { $set: { deleted: true } });
    data.cert = cert;
    await next();
  })
  .put('/', OnlyUnbannedUser(), async (ctx, next) => {
    const { body, db, data } = ctx;
    const { user } = data;
    const { certsId } = body;
    await db.ShopCertModel.updateMany(
      {
        uid: user.uid,
        _id: { $in: certsId },
        type: 'refund',
        deletable: true,
      },
      {
        $set: {
          deletable: false,
        },
      },
    );
    await next();
  })
  .post('/', OnlyUnbannedUser(), async (ctx, next) => {
    const { settings, tools, db, body, data, fsPromise } = ctx;
    const { files, fields } = body;
    const { type, orderId, paramId } = fields;
    const { user } = data;
    let param, order;
    if (orderId) {
      order = await db.ShopOrdersModel.findById(orderId);
    }
    if (paramId && order) {
      param = await order.getParamById(paramId);
    }
    if (orderId) {
      const { sellUid, buyUid } = order;
      if (![sellUid, buyUid].includes(user.uid)) {
        ctx.throw(403, '您没有权限上传凭证');
      }
      const certCount = await db.ShopCertModel.countDocuments({
        uid: user.uid,
        deleted: false,
        orderId,
        paramId,
        type: 'refund',
      });
      if (certCount >= 5) {
        ctx.throw(400, '凭证数已达最大值');
      }
    }
    const { name, size, path } = files.file;
    const { shopCertSmallImageify, shopCertImageify } = tools.imageMagick;
    if (!['refund', 'shopping'].includes(type)) {
      ctx.throw(400, `未知的上传类型 type: ${type}`);
    }
    const { shopCertsPath, generateFolderName } = settings.upload;
    const datePath = generateFolderName(shopCertsPath);
    const certId = await db.SettingModel.operateSystemID('shopCerts', 1);
    let ext = pathModule.extname(name).replace('.', '');
    ext = ext.toLowerCase();
    if (ext === 'exe') {
      ctx.throw(400, '不允许的文件格式');
    }
    const imgExt = ['jpg', 'jpeg', 'png'];
    if (imgExt.includes(ext)) {
      ext = 'jpg';
      const targetPath = shopCertsPath + datePath + certId + '.jpg';
      const targetSmallPath = shopCertsPath + datePath + certId + '_sm.jpg';
      await shopCertImageify(path, targetPath);
      await shopCertSmallImageify(path, targetSmallPath);
      await fsPromise.unlink(path);
    } else {
      const targetPath = shopCertsPath + datePath + certId + '.' + ext;
      await fsPromise.copyFile(path, targetPath);
    }
    const cert = db.ShopCertModel({
      _id: certId,
      uid: user.uid,
      type,
      size,
      path: datePath,
      ext,
      name,
      orderId,
      paramId: param ? param.costId : '',
    });
    await cert.save();
    data.cert = cert;
    await next();
  });
module.exports = router;
