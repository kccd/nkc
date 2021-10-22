const router = require('koa-router')();
router
  .post('/', async (ctx, next) =>{
    const {db, body} = ctx;
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
      threadStyle,
      blockStyle,
      coverPosition,
      threadCount,
      disabled,
      fixedThreadCount,
      autoThreadCount,
      fixedThreadsId,
      sort
    } = block;
    await db.HomeBlockModel.checkBlockValue(block);
    const sameName = await db.HomeBlockModel.findOne({name}, {_id: 1});
    if(sameName) ctx.throw(400, `模块名已存在`);

    const homeBlock = db.HomeBlockModel({
      _id: await db.SettingModel.operateSystemID('homeBlock', 1),
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
      threadStyle,
      coverPosition,
      threadCount,
      disabled,
      blockStyle,
      fixedThreadCount,
      autoThreadCount,
      fixedThreadsId,
      sort
    });
    await homeBlock.save();
    await homeBlock.updateThreadsId();
    await next();
  })
  //改变主页模块顺序
  .put('/', async (ctx, next) => {
    const {body, db} = ctx;
    const {left, right} = body.homeBlocksId;
    const blocksId = [].concat(
      left.map(_id => ({_id, position: 'left'})),
      right.map(_id => ({_id, position: 'right'}))
    );
    const blocks = await db.HomeBlockModel.find({}, {_id: 1});
    if(blocks.length !== blocksId.length) ctx.throw(400, `模块数量错误，请刷新后重试`);
    const blocksObj = {};
    blocks.map(b => blocksObj[b._id] = b);
    for(const {_id} of blocksId) {
      if(!blocksObj[_id]) ctx.throw(400, `模块 ID 错误，bid: ${_id}`);
    }
    for(let i = 0; i < blocksId.length; i++) {
      const {_id, position} = blocksId[i];
      await db.HomeBlockModel.updateOne({_id}, {
        $set: {
          position,
          order: i + 1
        }
      });
    }
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
      threadStyle,
      coverPosition,
      threadCount,
      disabled,
      blockStyle,
      fixedThreadCount,
      autoThreadCount,
      fixedThreadsId,
      sort
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
        threadStyle,
        coverPosition,
        threadCount,
        disabled,
        blockStyle,
        fixedThreadCount,
        autoThreadCount,
        fixedThreadsId,
        sort
      }
    });
    await next();
  })
  .put(':/bid/disabled', async (ctx, next) => {
    const {data, body} = ctx;
    const {homeBlock} = data;
    const {disabled} = body;
    await homeBlock.updateOne({
      $set: {
        disabled
      }
    });
    await next();
  })
  .del(':/bid', async (ctx, next) => {
    const {data} = ctx;
    const {homeBlock} = data;
    await homeBlock.deleteOne();
    await next();
  })
module.exports = router;