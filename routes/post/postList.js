const Router =require('koa-router')
const router =new Router()
router.get('/',async (ctx,next)=>{
  const {db, data, query}=ctx;
    const {page=1,limit=10,type='get',pid='',id=''} = query
    if(type === 'search'){
      const regex=new RegExp(`${pid}`,"g")
      data.postList= await db.PostModel.find({"c":regex})
    }else{
      const skipLength=(page-1) * 10
      data.postList= await db.PostModel.find().skip(skipLength).limit(limit)
    }
})
module.exports=router