const Router = require('koa-router');
const router = new Router();
const VerifiedUploadModel = require("../../dataModels/VerifiedUploadModel");

router
  // 认证者查看自己上传的认证材料(只有上传者本人有权限查看)
	.get('/:vid', async (ctx, next) => {
		const {params, data, db} = ctx;
    const {vid} = params;
    const {user} = data;
    const asset = await VerifiedUploadModel.findOne({ _id: vid });
    if(!asset) {
      return ctx.throw(404, "未找到附件");
    }
    if(asset.uid !== user.uid) {
      return ctx.throw(403, "你不是附件的上传者，所以无权查看此附件");
    }
    ctx.filePath = await asset.getFilePath();
    ctx.type = asset.ext;
    return next();
  })
module.exports = router;
