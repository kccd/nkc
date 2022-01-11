const router=require('koa-router')()
router.post('/',async (ctx,next)=>{
  const {body, db} = ctx;
  console.log(body)

  const {fields} = body;
  const {aid}=fields
  const {title, content} = JSON.parse(fields.article);
  console.log('title',title,content,aid)
  const result= await db.DocumentModel.updateOne({sid:aid},{$push:{chapters:{name:title,content}}})
  // const result= await db.DocumentModel.update({_id:54},{$push:{chapters:{name:3,content:3}}})
  
  console.log('result',result);
}) 
module.exports=router