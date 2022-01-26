const router = require('koa-router')();
const callBack=async (ctx,next)=>{
  const {db, body, data:a} = ctx
  const {data:updateData, bid} = body
  let filteredData;
  if(updateData){
     filteredData= await db.BookModel.filterList(updateData)
  }

  const res = await db.BookModel.updateOne(
    { _id: bid },
    { $set: { list: filteredData } }
  );
}
router
  .del('/list/delete', callBack )
  .post('/list/move', callBack )
  .post('/list/add', callBack )
  
module.exports = router;