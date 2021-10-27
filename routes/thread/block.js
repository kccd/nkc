const Router = require('koa-router');
const router = new Router();
router
  .post('/', async (ctx, next) => {
    const {data, db, params, body} = ctx;
    const {tid} = params;
    const {blocksId} = body;
    const homeBlock = await db.HomeBlockModel.find({defaultBlock: false});
    for(const block of homeBlock){
      if(!block) break;
      if(block.fixedThreadsId.includes(tid) && blocksId.includes(block._id)){
        continue;
      } else if (!block.fixedThreadsId.includes(tid) && blocksId.includes(block._id)){
        await db.HomeBlockModel.updateOne({_id: block._id}, {
          $addToSet: {
            fixedThreadsId: tid
          }
        });
      } else if(block.fixedThreadsId.includes(tid) && !blocksId.includes(block._id)) {
        await db.HomeBlockModel.updateOne({_id: block._id}, {
          $pull: {
            fixedThreadsId: tid
          }
        });
      }
    }
    await next();
  })
module.exports = router;
