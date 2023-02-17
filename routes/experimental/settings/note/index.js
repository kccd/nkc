const  Router = require("koa-router");
const router = new Router();

router.get('/',async (ctx,next) => {
   const {data,db}=ctx;
   const keyWordGroup = await db.SettingModel.getSettings('review')
   const keyWordGroupChecked = await db.SettingModel.getSettings('note')
   data.keyWordGroup = keyWordGroup.keyword.wordGroup//已经设置好了的敏感词库
   data.keyWordGroupChecked = keyWordGroupChecked.keyWordGroup //获取note敏感词库中已经勾选的数据
   data.enabled = keyWordGroupChecked.enabled //获取note中的开启敏感词检测状态
   ctx.template = 'experimental/settings/note/note.pug'
   await  next();
})
  .put('/',async (ctx,next) => {
    const {db,body:{enabled,keyWordGroup,keyWordGroupChecked}} = ctx;
    const arr = keyWordGroup.map(e => e.id) //敏感词库
    const unKnownArr = keyWordGroupChecked.filter(item => arr.indexOf(item) === -1) //返回的是前端提交的keyWordGroupChecked中keyWordGroup没有的词
    if( typeof enabled !== 'boolean') {
       ctx.throw(400,'enabled不是布尔值类型')
    }
    if( !Array.isArray(keyWordGroupChecked)) {
      ctx.throw(400,'keyWordGroupChecked不是数组类型')
    }
    if( unKnownArr.length !== 0) {
      ctx.throw(400,`上传的keyWordGroupChecked中有id不匹配`)
    }
    const data = await db.SettingModel.updateOne({_id: 'note'}, {
      $set:{
        "c.enabled": !!enabled,
        "c.keyWordGroup": keyWordGroupChecked,
      }
    })
    await  db.SettingModel.saveSettingsToRedis('note') //更新缓存
  })

module.exports = router;
