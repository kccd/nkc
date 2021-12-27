const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    // 打开素材管理主页
    const {db, data} = ctx;
    let materials = await db.MaterialModel.find({mid: ''});
    //拓展素材
    materials = await db.MaterialModel.extentMaterialsInfo(materials);
    data.materials = materials;
    await next();
  })
  .get('/editor', async (ctx, next) => {
    const {db, params} = ctx;
    ctx.remoteTemplate = 'creation/index.pug';
    await next();
  })
  .get('/document', async (ctx, next) => {
    const {db, query, data} = ctx;
    const {documentId} = query;
    const document = await db.DocumentModel.findOnly({_id: documentId});
    if(!document) return ctx.throw(404, '未找到文档,请刷新后重试!');
    data.document = document;
    await next();
  })
  .post('/', async (ctx, next) => {
    // 创建文件夹或素材
    const {db, body, state, nkcModules} = ctx;
    const {name, type, mid, targetId} = body;
    const {checkString} = nkcModules.checkData;
    checkString(name, {
      name: '文件名',
      minLength: 1,
      maxLength: 50
    });
    const oldMaterial = await db.MaterialModel.findOne({name, mid: mid?mid:''});
    if(oldMaterial) return ctx.throw(400, '文件名已存在');
    const material = db.MaterialModel({
      _id: await db.SettingModel.operateSystemID('materials', 1),
      name,
      type,
      mid,
      targetId,
      uid: state.uid
    });
    await material.save();
    await next();
  })
  .post('/del', async (ctx, next) => {
    const {db, body} = ctx;
    const {selectFoldersId} = body;
    await db.MaterialModel.deleteMany({_id: {$in: selectFoldersId}});
    await next();
  })
  .post('/editor', async (ctx, next) => {
    //修改文件或文件名
    const {db, body, nkcModules} = ctx;
    const {_id, name, mid} = body;
    const {checkString} = nkcModules.checkData;
    checkString(name, {
      name: '文件名',
      minLength: 1,
      maxLength: 50
    });
    const material = await db.MaterialModel.findOnly({_id});
    if(!material) return ctx.throw(400, '文件或文件夹未找到,刷新后哦重试');
    const oldMaterial = await db.MaterialModel.findOne({name, mid: mid?mid:''});
    if(oldMaterial && oldMaterial._id !== _id) return ctx.throw(400, '文件名已存在');
    await db.MaterialModel.updateOne({_id}, {$set: {
      name,
      tlm: new Date(),
    }});
    await next();
  })
  .post('/drag', async (ctx, next) => {
    const {db, body} = ctx;
    const {dragenterId, dragId} = body;
    if(dragenterId === dragId) return ctx.throw(400, '不可拖动到同一文件夹');
    if(!dragenterId || !dragId) return ctx.throw(400, '文件夹或目标文件夹未找到');
    const material = await db.MaterialModel.findOne({_id: dragId});
    const materialFolder = await db.MaterialModel.findOne({_id: dragenterId});
    if(materialFolder.type !== 'folder') return ctx.throw(400, '只能拖动到文件夹中');
    if(!material) return ctx.throw(404, '文件或文件夹不存在');
    await material.updateOne({
      mid: dragenterId
    });
    await next();
  })
  .post('/material', async (ctx, next) => {
    const {db, data, body, state} = ctx;
    const {name, content, mid, documentId, type, materialId} = body;
    if(!['modify', 'publish', 'create'].includes(type)) ctx.throw(400, `未知的提交类型 type: ${type}`);
    let material;
    if(type === 'create') {
      //创建素材和文档
      material = await db.MaterialModel.createMaterial({
        uid: state.uid,
        name: name,
        mid,
        content,
      });
      if(material.type !== 'document') return ctx.throw(400, '素材不是文档类型');
    } else {
      material = await db.MaterialModel.findOnly({_id: materialId});
      if(material.type !== 'document') return ctx.throw(400, '素材不是文档类型');
      await material.modifyMaterial({
        name,
        content,
      });
      if(type === 'publish') {
        await material.publishMaterial();
      }
    }
    data.materialId = material._id;
    data.documentId = material.targetId || material.betaDid;
    await next();
  })
module.exports = router;
