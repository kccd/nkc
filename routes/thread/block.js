const Router = require('koa-router');
const router = new Router();
router
  .post('/', async (ctx, next) => {
    const {db, params, body} = ctx;
    const {tid} = params;
    const {blocksId} = body;
    const homeBlock = await db.HomeBlockModel.find({defaultBlock: false}, {_id: 1});
    const homeBlocksId = homeBlock.map(hb => hb._id);
    const pullHomeBlocksId = [];
    const addHomeBlocksId = [];
    for(const id of homeBlocksId) {
      if(blocksId.includes(id)) {
        addHomeBlocksId.push(id);
      } else {
        pullHomeBlocksId.push(id);
      }
    }
    await db.HomeBlockModel.updateMany({_id: {$in: pullHomeBlocksId}}, {
      $pull: {
        fixedThreadsId: tid
      }
    });
    await db.HomeBlockModel.updateMany({_id: {$in: addHomeBlocksId}}, {
      $addToSet: {
        fixedThreadsId: tid
      }
    });
    await next();
  })
module.exports = router;
