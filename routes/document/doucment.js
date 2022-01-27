const router = require('koa-router')();
router
.get('/preview', async (ctx, next) => {
  ctx.template='document/preview/document.pug'
  const {db, data, params, state} = ctx;
  const {did} = params
  const document = await db.DocumentModel.findOne({did: did, uid: state.uid}).sort({tlm: -1});
  data.document = document
  await next()
})
.get('/history', async (ctx, next)=>{
  ctx.template = 'document/history/document.pug'
  const {db, data,params,state,query} = ctx;
  const {did} = params
  const {bid} = query
  //  获取列表
  data.history = await db.DocumentModel.find({ $and:[{ did: did }, {type: 'history'}, {uid: state.uid}] }).sort({ tlm:-1 });
  if(data.history.length){
    // 默认返回第一项内容
    data.document = data.history[0]
    data.bookId = bid
  }else{
    data.document='',
    data.bookId=''
  }
  await next()
})
.get('/history/:_id',async (ctx, next)=>{
  ctx.template = 'document/history/document.pug'
  const {db, data, params, state, query} = ctx;
  const { bid } = query
  const { _id, did } = params
  data.bookId = bid
  data.history =  await db.DocumentModel.find({ $and:[{did:did}, {type:'history'}, {uid:state.uid}] }).sort({tlm:-1});
  function find(data, id){
    for (const obj of data) {
      if(obj._id == id) return obj
    }
  }
  data.document = find(data.history, _id)
  await next()
})
module.exports = router;