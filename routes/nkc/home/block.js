const router = require('koa-router')();
router
  //新建模块
  .post('/', async (ctx, next) =>{
    const {db, body, nkcModules} = ctx;
    const {block} = body;
    const {checkString, checkNumber} = nkcModules.checkData;
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
    checkString(name, {
      name: '模块名',
      minLength: 2,
      maxLength: 20
    });
    checkString(threadStyle, {
      name: '文章列表风格',
      minLength: 1,
      maxLength: 20
    });
    checkString(blockStyle.headerTitleColor, {
      name: '模块名称颜色',
      minLength: 1,
      maxLength: 20
    });
    checkString(blockStyle.backgroundColor, {
      name: '模块背景颜色',
      minLength: 1,
      maxLength: 20
    });
    // checkString(blockStyle.usernameColor, {
    //   name: '用户名颜色',
    //   minLength: 0,
    //   maxLength: 20
    // });
    // checkString(blockStyle.forumColor, {
    //   name: '专业名颜色',
    //   minLength: 0,
    //   maxLength: 20
    // });
    // checkString(blockStyle.titleColor, {
    //   name: '文章标题颜色',
    //   minLength: 0,
    //   maxLength: 20
    // });
    // checkString(blockStyle.abstractColor, {
    //   name: '文章摘要颜色',
    //   minLength: 0,
    //   maxLength: 20
    // });
    // checkString(blockStyle.infoColor, {
    //   name: '时间等其他信息颜色',
    //   minLength: 1,
    //   maxLength: 20
    // });
    checkString(coverPosition, {
      name: '文章封面图位置',
      minLength: 1,
      maxLength: 20
    });
    checkString(sort, {
      name: '显示时的排序',
      minLength: 1,
      maxLength: 20
    });
    checkNumber(postCountMin, {
      name: '回复数最小值',
      min: 0,
      max: 5000
    });
    checkNumber(voteUpMin, {
      name: '点赞数最小值',
      min: 0,
      max: 5000
    });
    checkNumber(voteUpTotalMin, {
      name: '文章加所有回复的点赞数最小值',
      min: 0,
      max: 5000
    });
    checkNumber(voteDownMax, {
      name: '最大点踩数',
      min: 0,
      max: 5000
    });
    checkNumber(updateInterval, {
      name: '更新的间隔时间',
      min: 0,
      max: 5000
    });
    checkNumber(timeOfPostMin, {
      name: '发表时间距离当前最小值',
      min: 0,
      max: 5000
    });
    checkNumber(timeOfPostMax, {
      name: '发表时间距离当前最大值',
      min: 0,
      max: 5000
    });
    checkNumber(fixedThreadCount, {
      name: '手动推送文章显示条数',
      min: 0,
      max: 5000
    });
    checkNumber(autoThreadCount, {
      name: '自动推送文章入选条数',
      min: 0,
      max: 5000
    });
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
    data.homeBlock = await db.HomeBlockModel.findOnly({_id: bid});
    await next();
  })
  .get('/:bid', async (ctx, next) => {
    const {data, db} = ctx;
    const {homeBlock} = data;
    data.threadCategories = await db.ThreadCategoryModel.getCategoryTree();
    data.forums = [];
    if(homeBlock.forumsId.length !== 0) {
      data.forums = await db.ForumModel.find({fid: {$in: homeBlock.forumsId}});
    }
    await next();
  })
  //编辑模块
  .put('/:bid', async (ctx, next) => {
    const {data, db, body, nkcModules} = ctx;
    const {homeBlock} = data;
    const {block} = body;
    const {checkString, checkNumber} = nkcModules.checkData;
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
    checkString(name, {
      name: '模块名',
      minLength: 2,
      maxLength: 20
    });
    checkString(threadStyle, {
      name: '文章列表风格',
      minLength: 1,
      maxLength: 20
    });
    checkString(blockStyle.headerTitleColor, {
      name: '模块名称颜色',
      minLength: 1,
      maxLength: 20
    });
    checkString(blockStyle.backgroundColor, {
      name: '模块背景颜色',
      minLength: 1,
      maxLength: 20
    });
    // checkString(blockStyle.usernameColor, {
    //   name: '用户名颜色',
    //   minLength: 0,
    //   maxLength: 20
    // });
    // checkString(blockStyle.forumColor, {
    //   name: '专业名颜色',
    //   minLength: 0,
    //   maxLength: 20
    // });
    // checkString(blockStyle.titleColor, {
    //   name: '文章标题颜色',
    //   minLength: 0,
    //   maxLength: 20
    // });
    // checkString(blockStyle.abstractColor, {
    //   name: '文章摘要颜色',
    //   minLength: 0,
    //   maxLength: 20
    // });
    // checkString(blockStyle.infoColor, {
    //   name: '时间等其他信息颜色',
    //   minLength: 1,
    //   maxLength: 20
    // });
    checkString(coverPosition, {
      name: '文章封面图位置',
      minLength: 1,
      maxLength: 20
    });
    checkString(sort, {
      name: '显示时的排序',
      minLength: 1,
      maxLength: 20
    });
    checkNumber(postCountMin, {
      name: '回复数最小值',
      min: 0,
      max: 5000
    });
    checkNumber(voteUpMin, {
      name: '点赞数最小值',
      min: 0,
      max: 5000
    });
    checkNumber(voteUpTotalMin, {
      name: '文章加所有回复的点赞数最小值',
      min: 0,
      max: 5000
    });
    checkNumber(voteDownMax, {
      name: '最大点踩数',
      min: 0,
      max: 5000
    });
    checkNumber(updateInterval, {
      name: '更新的间隔时间',
      min: 0,
      max: 5000
    });
    checkNumber(timeOfPostMin, {
      name: '发表时间距离当前最小值',
      min: 0,
      max: 5000
    });
    checkNumber(timeOfPostMax, {
      name: '发表时间距离当前最大值',
      min: 0,
      max: 5000
    });
    checkNumber(fixedThreadCount, {
      name: '手动推送文章显示条数',
      min: 0,
      max: 5000
    });
    checkNumber(autoThreadCount, {
      name: '自动推送文章入选条数',
      min: 0,
      max: 5000
    });
    await db.HomeBlockModel.checkBlockValue(block);
    const sameName = await db.HomeBlockModel.findOne({_id: {$ne: homeBlock._id}, name});
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
  .put('/:bid/disabled', async (ctx, next) => {
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
  .del('/:bid', async (ctx, next) => {
    const {data} = ctx;
    const {homeBlock} = data;
    await homeBlock.deleteOne();
    await next();
  })
module.exports = router;