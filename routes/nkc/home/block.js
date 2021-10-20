const router = require('koa-router')();
router
  .post('/', async (ctx, next) =>{
    const {db, body} = ctx;
    const {block} = body;
    const {
      name,
    } = block;
    await db.HomeBlockModel.checkBlockValue(block);
    const sameName = await HomeBlockModel.findOne({name}, {_id: 1});
    if(sameName) ctx.throw(400, `模块名已存在`);
    block._id = await db.SettingModel.operateSystemID('homeBlock', 1);
    const homeBlock = db.HomeBlockModel(block);
    await homeBlock.save();
    await db.SettingModel.updateOne({_id: 'home'}, {
      $addToSet: {
        'c.homeBlocksId.left': homeBlock._id
      }
    });
    await db.SettingModel.saveSettingsToRedis('home');
    await next();
  })
  .put('/', async (ctx, next) => {
    const {body, db} = ctx;
    const {left, right} = body.homeBlocksId;
    //大轮播 置顶文章 商品 右侧小图 专业导航 热门专栏
    const defaultBlocksId = ['recommendThreadsMovable', 'toppedThreads', 'goods', 'recommendThreadsFixed', 'forums', 'toppedColumns']
    let blocksId = left.concat(right);
    blocksId = blocksId.filter(id => !defaultBlocksId.includes(id));
    const blocks = await db.HomeBlockModel.find({_id: {$in: blocksId}});
    const blocksObj = {};
    blocks.map(b => blocksObj[b._id]);
    for(const id of blocksId) {
      if(!blocksObj[id]) ctx.throw(400, `模块 ID 错误，bid: ${id}`);
    }
    await db.SettingModel.updateOne({_id: 'home'}, {
      $set: {
        'c.homeBlocksId': {
          left,
          right
        }
      }
    });
    await db.SettingModel.saveSettingsToRedis('home');
    await next();
  })
  .use('/:bid', async (ctx, next) => {
    const {params, db, data} = ctx;
    const {bid} = params;
    data.homeBlock = await db.HomeBlockModel.findOnly({_id: Number(bid)});
    await next();
  })
  .put('/:bid', async (ctx, next) => {
    const {data, db, body} = ctx;
    const {homeBlock} = data;
    const {block} = body;
    const {
      name,
      forumsId,
      tcId,
      digest,
      origin,
      postCountMin,
      voteUpMin,
      voteUpTotalMin,
      voteDownMax,
      updateInterval,
      timeOfPostMin,
      timeOfPostMax,
      listStyle,
      coverPosition,
      threadCount,
      disabled,
      threadSource,
    } = block;
    await db.HomeBlockModel.checkBlockValue(block);
    const sameName = await db.HomeBlockModel.findOne({_id: {$ne: homeBlock._id, name}});
    if(sameName) ctx.throw(400, `模块名已存在`);
    await homeBlock.updateOne({
      $set: {
        name,
        forumsId,
        tcId,
        digest,
        origin,
        postCountMin,
        voteUpMin,
        voteUpTotalMin,
        voteDownMax,
        updateInterval,
        timeOfPostMin,
        timeOfPostMax,
        listStyle,
        coverPosition,
        threadCount,
        disabled,
        threadSource,
      }
    });
    await next();
  })
  .del(':/bid', async (ctx, next) => {
    const {data} = ctx;
    const {homeBlock} = data;
    await homeBlock.deleteOne();
    await db.SettingModel.updateOne({_id: 'home'}, {
      $pull: {
        'c.homeBlocksId.left': homeBlock._id,
        'c.homeBlocksId.right': homeBlock._id
      }
    });
    await db.SettingModel.saveSettingsToRedis('home');
    await next();
  })
module.exports = router;