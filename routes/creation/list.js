const router = require('koa-router')();
const callBack = async (ctx,next)=>{
  const {db, body} = ctx
  const {data:updateData, bid} = body
  let filteredData = await db.BookModel.filterList(updateData)
  await db.BookModel.updateOne(
    { _id: bid },
    { $set: { list: filteredData } }
  );
}
router
  .post('/list/delete', callBack )
  .post('/list/move', callBack )
  .post('/list/add', callBack )
  
module.exports = router;