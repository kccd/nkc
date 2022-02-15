const router = require('koa-router')();
router
.get('/preview', async (ctx, next) => {
  ctx.template='document/preview/document.pug'
  const {db, data, params, state} = ctx;
  const {did} = params
  const document = await db.DocumentModel.find({did: did, uid: state.uid}).sort({tlm: -1}).skip(0).limit(1);
  data.document = document[0]
  await next()
})
.get('/history', async (ctx, next)=>{
  ctx.template = 'document/history/document.pug'
  const {db, data, params, state, query} = ctx;
  const {did} = params
  const {bid} = query
  //  获取列表
  data.history = await db.DocumentModel.find({ $and:[{ did: did }, {type: 'history'}, {uid: state.uid}] }).sort({ tlm:-1 });
  if(data.history.length){
    // 默认返回第一项内容
    data.document = data.history[0]
    data.bookId = bid
  }else{
    data.document = '',
    data.bookId = ''
  }
  await next()
})
.get('/history/:_id',async (ctx, next)=>{
  ctx.template = 'document/history/document.pug'
  const {db, data, params, state, query} = ctx;
  const { bid } = query
  const { _id, did } = params
  data.bookId = bid
  data.history =  await db.DocumentModel.find({ $and:[{did}, {type:'history'}, {uid:state.uid}] }).sort({tlm:-1});
  function find(data, id){
    for (const obj of data) {
      if(obj._id == id) return obj
    }
  }
  data.document = find(data.history, _id)
  await next()
})
.get('/history/:sid/:_id/publish',async (ctx, next)=>{
  // /document/:did/history/:_id/publish
  const {db, params} = ctx;
  // const {_id, did} = params;
  const stableDocument = await db.DocumentModel.findOne({did, type: 'stable'});
  // if(!stable)
  // const {db, params} = ctx;
  const { _id, sid } = params;
  // 并且选中的 历史版 变为 正式版，原先的版本（编辑版 或 正式版）变为历史版
  await db.DocumentModel.updateOne({$or:[{$and:[{"type":'beta'}, {sid}]}, {$and:[{"type":'stable'}, {sid}]}]}, {$set:{type:'history'}});
  await db.DocumentModel.updateOne({
    sid,
    type: {$in: ['beta', 'stable']}
  }, {
    $set: {
      type: 'history'
    }
  })
  await db.DocumentModel.updateOne({$and: [{_id}, {sid}, {type:'history'}] }, {$set:{type:'stable'}});
  await next()
})
.get('/history/:did/:_id/edit',async (ctx, next)=>{
  const {db, params} = ctx;
  const { _id, did } = params;
  // 当前历史记录复制一份并改为为编辑版
  // 把正在编辑版本的改为历史记录
  // await db.DocumentModel.updateOne({$or:[{$and:[{"type":'beta'}, {did}]}, {$and:[{"type":'stable'}, {did}]}]}, {$set:{type:'history'}});
  // await db.DocumentModel.updateOne({$and: [{_id}, {did}, {type:'history'}] }, {$set:{type:'beta'}});
  await next()
})
module.exports = router;