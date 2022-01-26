const router = require('koa-router')();
const callBack=async (ctx,next)=>{
  const {db, data, body}=ctx
  const {data:updateData,bid}=body
  const filteredData= await db.BookModel.filterList(updateData)
  const res = await db.BookModel.updateOne(
    { _id: bid },
    { $set: { list: filteredData } }
  );
}
router
  .delete('/list/delete', callBack )
  .post('/list/move', callBack )
  .post('/list/add', callBack )
  
module.exports = router;