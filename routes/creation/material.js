const router = require('koa-router')();
router
  // .use('/', async (ctx, next) => {
  //   const {data, db} = ctx;
  //   data.material = null;
  //   await next();
  // })
  // .get('/', async (ctx, next) => {
  //   ctx.remoteTemplate = 'creation/index.pug';
  //   await next();
  // })
  .get('/:mid', async (ctx, next) => {
    // 打开素材或文件夹
    const {db, data, params, nkcModules} = ctx;
    const {mid} = params;
    const {timeFormat, getUrl} = nkcModules.tools;
    //根据文件mid获取面包屑数据
    const material = await db.MaterialModel.findOnly({_id: mid});
    const crumbs = await material.getCrumbs();
    data.materialData = {
      _id: material._id,
      name: material.name,
      crumbs,
      uid: material.uid,
      time: timeFormat(material.toc),
      mid: material.mid,
    };
    let materials = await db.MaterialModel.find({mid: mid});
    //拓展资源信息和文档信息
    materials = await db.MaterialModel.extentMaterialsInfo(materials);
    //按拼音首字母排序
    materials = nkcModules.pinyin.getGroupsByFirstLetter(materials, 'name');
    //合并分组
    materials = await db.MaterialModel.mergeMaterials(materials);
    data.materials = materials;
    await next();
  })
  .post('/:_id/editor', async (ctx, next) => {
    //修改文件夹或素材
    const {db, body, params, nkcModules} = ctx;
    const {_id} = params;
    const {name, mid} = body;
    const {checkString} = nkcModules.checkData;
    checkString(name, {
      name: '文件名',
      minLength: 1,
      maxLength: 50
    });
    const material = await db.MaterialModel.findOnly({_id});
    if(!material) return ctx.throw(400, '文件或文件夹未找到,请刷新后重试');
    const oldMaterial = await db.MaterialModel.findOne({name, mid: mid?mid:''});
    if(oldMaterial && oldMaterial._id !== _id) return ctx.throw(400, '文件名已存在');
    await db.MaterialModel.updateOne({_id}, {$set: {
        name,
        tlm: new Date(),
    }});
    await next();
  })
  .del('/:_id', async (ctx, next) => {
    const {db, params, body} = ctx;
    const {_id} = params;
    const material = await db.MaterialModel.findOnly({_id});
    if(!material) return ctx.throw(400, '文件或文件夹未找到,请刷新后重试');
    await db.MaterialModel.deleteOne({_id});
    await next();
  })
module.exports = router;
