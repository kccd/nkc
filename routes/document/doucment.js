const router = require('koa-router')();
router
.get('/preview', async (ctx, next) => {
  ctx.template='document/preview/document.pug'
  // ctx.remoteTemplate=''
  const {db, data,params,state} = ctx;
  const {did}=params
  const document = await db.DocumentModel.find({did:did,uid:state.uid}).sort({tlm:-1});
  data.document = document[0].toObject()
  await next()
})
.get('/history', async (ctx, next)=>{
  ctx.template='document/history/document.pug'
  const {db, data,params,state,query} = ctx;
  const {did}=params
  const {bid}=query

  data.history = await db.DocumentModel.find({$and:[{did:did},{type:'history'},{uid:state.uid}]}).sort({tlm:-1});
  if(data.history.length){
    data.document = await db.DocumentModel.findOnly({_id:data.history[0]._id,uid:state.uid,type:'history'})
    data.bookId=bid
  }else{
    data.document='',
    data.bookId=''
  }
  await next()
})
.get('/history/:_id',async (ctx, next)=>{
  ctx.template='document/history/document.pug'
  const {db, data,params,state,query} = ctx;
  const {bid}=query
  const {_id,did}=params
  data.bookId=bid
  data.document = await db.DocumentModel.findOnly({_id,uid:state.uid,type:'history'})
  data.history =  await db.DocumentModel.find({$and:[{did:did},{type:'history'},{uid:state.uid}]}).sort({tlm:-1});
  await next()
})
module.exports = router;