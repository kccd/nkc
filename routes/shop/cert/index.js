const Router = require("koa-router");
const pathModule = require("path");
const router = new Router();
router
  .get("/:_id", async (ctx, next) => {
    const {settings, db, data, params, query} = ctx;
    let {type} = query;
    const {_id} = params;
    const {user} = data;
    const cert = await db.ShopCertModel.findOne({_id, deleted: false});
    if(!cert) ctx.throw(404, `未找到ID为【${_id}】的凭证资源`);
    if(user.uid !== cert.uid && !ctx.perimission("getAnyBodyShopCert")) {
      ctx.throw(403, "您没有权限查看别人的凭证");
    } 
    const {ext, name, path} = cert;
    type = (type==="sm" && ext === "jpg")? "_sm": "";
    ctx.filePath = settings.upload.shopCertsPath + path + _id + type + "." + ext;
    ctx.fileName = name;
    ctx.set("Content-Type", "image/jpg");
    await next();
  })
  .del("/:_id", async (ctx, next) => {
    const {params, data, db} = ctx;
    const {_id} = params;
    const {user} = data;
    const cert = await db.ShopCertModel.findOne({_id, deleted: false});
    if(!cert) ctx.throw(404, `未找到ID为【${_id}】的凭证资源`);
    if(user.uid !== cert.uid) {
      ctx.throw(403, "您没有权限删除别人的凭证");
    }
    if(!cert.deletable) ctx.throw(400, "已提交的凭证无法删除");
    await db.ShopCertModel.update({_id}, {$set: {deleted: true}});
    data.cert = cert;
    await next();
  })
  .patch("/", async (ctx, next) => {
    const {body, db, data} = ctx;
    const {user} = data;
    const {certsId} = body;
    await db.ShopCertModel.updateMany({
      uid: user.uid,
      _id: {$in: certsId},
      type: "refund",
      deletable: true
    }, {
      $set: {
        deletable: false
      }
    });
    await next();
  })
  .post("/", async (ctx, next) => {
    const {settings, tools, db, body, data} = ctx;
    const {files, fields} = body;
    const {type, orderId} = fields;
    const {user} = data;
    if(orderId) {
      const order = await db.ShopOrdersModel.findById(orderId);
      const product = await db.ShopGoodsModel.findById(order.productId);
      if(![order.uid, product.uid].includes(user.uid)) {
        ctx.throw(403, "您没有权限上传凭证");
      }
      const certCount = await db.ShopCertModel.count({
        uid: user.uid,
        deleted: false,
        orderId,
        type: "refund"
      });
      if(certCount >= 5) ctx.throw(400, "凭证数已达最大值");
    }
    const {name, size, path} = files.file;
    const {shopCertSmallImageify, shopCertImageify} = tools.imageMagick;
    if(!["refund", "shopping"].includes(type)) {
      ctx.throw(400, `未知的上传类型 type: ${type}`);
    }
    const {shopCertsPath, generateFolderName} = settings.upload;
    const datePath = generateFolderName(shopCertsPath);
    const certId = await db.SettingModel.operateSystemID("shopCerts", 1);
    let ext = pathModule.extname(name).replace('.', '');
    ext = ext.toLowerCase();
    if(ext === "exe") ctx.throw(400, "不允许的文件格式");
    const imgExt = ["jpg", "jpeg", "png"];
    if(imgExt.includes(ext)) {
      ext = 'jpg';
      const targetPath = shopCertsPath + datePath + certId + ".jpg";
      const targetSmallPath = shopCertsPath + datePath + certId + "_sm.jpg";
      await shopCertImageify(path, targetPath);
      await shopCertSmallImageify(path, targetSmallPath);
      await ctx.fs.unlink(path);
    } else {
      const targetPath = shopCertsPath + datePath + certId + "." + ext;
      await ctx.fs.rename(path, targetPath);
    }
    const cert = db.ShopCertModel({
      _id: certId,
      uid: user.uid,
      type,
      size,
      path: datePath,
      ext,
      name,
      orderId
    });
    await cert.save();
    data.cert = cert;
    await next();
  });
module.exports = router;