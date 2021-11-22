const router = require('koa-router')();
router
  .post('/', async (ctx, next) => {
    const {db, body, data} = ctx;
    const {user} = data;
    const {
      md5, filename
    } = body;
    if(!filename) ctx.throw(400, `文件名不能为空`);
    if(!md5) ctx.throw(400, `md5 不能为空`);
    let uploaded = false;
    const resource = await db.ResourceModel.findOne({
      prid: '',
      hash: md5,
      ext: {$ne: ''},
      mediaType: "mediaAttachment",
      state: 'usable',
      files: {$ne: {}}
    }).sort({toc: -1});
    if(resource) {
      const _file = {
        size: resource.size,
        ext: resource.ext
      };
      // 检测上传相关的权限
      await db.ResourceModel.checkUploadPermission(user, _file);
      // 在此处复制原resource的信息
      const {
        rid, size, ext, mediaType, files, state, type, hash, originId
      } = resource;
      const newId = await db.SettingModel.operateSystemID('resources', 1);
      const newResource = db.ResourceModel({
        rid: newId,
        prid: rid,
        oname: filename,
        originId,
        ext,
        size,
        hash,
        uid: user.uid,
        toc: new Date(),
        mediaType,
        state,
        type,
        files
      });
      await newResource.save();
      uploaded = true;
      data.r = newResource;
    }
    data.uploaded = uploaded;
    await next();
  });
module.exports = router;