const Router = require('koa-router');
const router = new Router();
const blockRouter = require('./block');
const nkcRender = require('../../../nkcModules/nkcRender');
const { getUrl, getAnonymousInfo } = require('../../../nkcModules/tools');
const { renderHTMLByJSON } = require('../../../nkcModules/nkcRender/json');
const anonymousUserInfo = getAnonymousInfo();
router
  .get('/', async (ctx, next) => {
    const { db, data } = ctx;
    data.nav = 'home';
    const homeSettings = await db.SettingModel.getSettings('home');
    data.ads = homeSettings.ads;
    data.recommendThreads = homeSettings.recommendThreads;
    data.recommendForumsId = homeSettings.recommendForumsId;
    const forums = await db.ForumModel.find({
      fid: { $in: data.recommendForumsId },
    });
    const forumsObj = {};
    forums.map((forum) => (forumsObj[forum.fid] = forum));
    data.recommendForums = [];
    data.recommendForumsId.map((fid) => {
      const forum = forumsObj[fid];
      if (forum) {
        data.recommendForums.push(forum);
      }
    });
    data.columns = [];
    data.poolColumns = [];
    data.toppedColumns = [];
    const columns = await db.ColumnModel.find(
      {
        _id: {
          $in: homeSettings.columnsId.concat(
            homeSettings.columnPool.columnsId,
            homeSettings.toppedColumnsId,
          ),
        },
      },
      {
        name: 1,
        _id: 1,
        subCount: 1,
        postCount: 1,
        tlm: 1,
        toc: 1,
        avatar: 1,
      },
    );
    const columnsObj = {};
    columns.map((c) => (columnsObj[c._id] = c));
    homeSettings.columnsId.map((cid) => {
      const column = columnsObj[cid];
      if (column) {
        data.columns.push(column);
      }
    });
    homeSettings.columnPool.columnsId.map((cid) => {
      const column = columnsObj[cid];
      if (column) {
        data.poolColumns.push(column);
      }
    });
    homeSettings.toppedColumnsId.map((cid) => {
      const column = columnsObj[cid];
      if (column) {
        data.toppedColumns.push(column);
      }
    });
    let goods = await db.ShopGoodsModel.find({
      disabled: false,
      productId: { $in: homeSettings.shopGoodsId },
    });
    goods = await db.ShopGoodsModel.extendProductsInfo(goods, {
      user: true,
      dealInfo: false,
      post: true,
      thread: false,
    });
    const goodsObj = {};
    goods.map((g) => (goodsObj[g.productId] = g));
    data.goods = [];
    homeSettings.shopGoodsId.map((productId) => {
      const product = goodsObj[productId];
      if (product) {
        data.goods.push(product);
      }
    });
    // 主页是否显示热销商品板块
    data.showShopGoods = homeSettings.showShopGoods;
    const threadsId = [];
    const articlesId = [];
    for (const t of homeSettings.toppedThreadsId) {
      if (t.type === 'thread') {
        threadsId.push(t.id);
      } else if (t.type === 'article') {
        articlesId.push(t.id);
      }
    }
    for (const t of homeSettings.latestToppedThreadsId) {
      if (t.type === 'thread') {
        threadsId.push(t.id);
      } else if (t.type === 'article') {
        articlesId.push(t.id);
      }
    }
    const articlesObj = {};
    const { normal } = await db.ArticleModel.getArticleStatus();
    let articles = await db.ArticleModel.find({
      _id: { $in: articlesId },
      status: normal,
    });
    articles = await db.ArticleModel.getArticlesInfo(articles);
    articles.map((article) => {
      if (article.document.l === 'json') {
        article.document.content = renderHTMLByJSON({
          json: article.document.content,
        });
      }
      articlesObj[article._id] = {
        type: 'article',
        id: article._id,
        title: article.document.title,
        abstract: nkcRender.htmlToPlain(
          article.document.abstract ||
            article.document.abstractEN ||
            article.document.content,
          200,
        ),
        url: article.url,
        coverUrl: article.document.cover
          ? getUrl('articleCover', article.document.cover)
          : '',
        userAvatarUrl: getUrl('userAvatar', article.user.avatar),
        userId: article.uid,
        username: article.user.username,
        userHomeUrl: getUrl('userHome', article.user.avatar),
      };
    });
    let threads = await db.ThreadModel.find({ tid: { $in: threadsId } });
    threads = await db.ThreadModel.extendThreads(threads, {
      forum: false,
      category: false,
      lastPost: false,
      lastPostUser: false,
      firstPost: true,
      firstPostUser: true,
      htmlToText: true,
    });
    const threadsObj = {};
    threads.map((thread) => {
      threadsObj[thread.tid] = {
        type: 'thread',
        id: thread.tid,
        title: thread.firstPost.t,
        abstract: nkcRender.htmlToPlain(
          thread.firstPost.abstractCn ||
            thread.firstPost.abstractEn ||
            thread.firstPost.c,
          200,
        ),
        url: getUrl('thread', thread.tid),
        coverUrl: thread.firstPost.cover
          ? getUrl('postCover', thread.firstPost.cover)
          : '',
        userAvatarUrl: thread.firstPost.anonymous
          ? anonymousUserInfo.avatarUrl
          : getUrl('userAvatar', thread.firstPost.user.avatar),
        userId: thread.firstPost.anonymous ? '' : thread.uid,
        username: thread.firstPost.anonymous
          ? anonymousUserInfo.username
          : thread.firstPost.user.username,
        userHomeUrl: getUrl('userHome', thread.firstPost.user.avatar),
      };
    });
    data.toppedThreads = [];
    data.latestToppedThreads = [];
    homeSettings.toppedThreadsId.map((t) => {
      const { type, id } = t;
      if (type === 'thread') {
        if (threadsObj[id]) {
          data.toppedThreads.push(threadsObj[id]);
        }
      } else if (type === 'article') {
        if (articlesObj[id]) {
          data.toppedThreads.push(articlesObj[id]);
        }
      }
    });
    homeSettings.latestToppedThreadsId.map((t) => {
      const { type, id } = t;
      if (type === 'thread') {
        if (threadsObj[id]) {
          data.latestToppedThreads.push(threadsObj[id]);
        }
      } else if (type === 'article') {
        if (articlesObj[id]) {
          data.latestToppedThreads.push(articlesObj[id]);
        }
      }
    });
    // 首页上 “最新原创” 板块文章条目显示模式 “simple”或空 - 简略， “full” - 完整
    data.originalThreadDisplayMode = homeSettings.originalThreadDisplayMode;
    // 是否在首页上显示“活动”入口
    data.showActivityEnter = homeSettings.showActivityEnter;
    data.columnListPosition = homeSettings.columnListPosition;
    data.columnCount = homeSettings.columnCount;
    data.columnListSort = homeSettings.columnListSort;
    data.columnPool = homeSettings.columnPool;
    data.showHomeForums = homeSettings.showHomeForums;
    data.showHomeWebApply = homeSettings.showHomeWebApply;
    data.navigationButtons = homeSettings.navigationButtons;
    ctx.template = 'nkc/home/home.pug';
    await next();
  })
  .post('/', async (ctx, next) => {
    const { body, data, db } = ctx;
    const { topType } = body.fields;
    const { cover } = body.files;
    data.coverHash = await db.AttachmentModel.saveRecommendThreadCover(
      cover,
      topType,
    );
    await next();
  })
  .put('/', async (ctx, next) => {
    const { nkcModules, body, db, data } = ctx;
    const { operation } = body;
    const { checkNumber, checkString } = nkcModules.checkData;
    if (operation === 'saveAds') {
      let { movable, fixed, movableOrder, fixedOrder } = body;
      movableOrder = movableOrder === 'random' ? 'random' : 'fixed';
      fixedOrder = fixedOrder === 'random' ? 'random' : 'fixed';
      movable.concat(fixed).map((ad) => {
        nkcModules.checkData.checkString(ad.title, {
          name: '标题',
          minLength: 1,
          maxLength: 200,
        });
        // if (!ad.cover) ctx.throw(400, "封面图不能为空");
        if (!ad.tid) {
          ctx.throw(400, '文章ID不能为空');
        }
      });
      await db.SettingModel.updateOne(
        { _id: 'home' },
        {
          $set: {
            'c.ads.movable': movable,
            'c.ads.fixed': fixed,
            'c.ads.fixedOrder': fixedOrder,
            'c.ads.movableOrder': movableOrder,
          },
        },
      );
    } else if (operation === 'updateThreadList') {
      const { type } = body;
      if (!['fixed', 'movable'].includes(type)) {
        ctx.throw(500, `数据类型错误 type: ${type}`);
      }
      await db.ThreadModel.updateAutomaticRecommendThreadsByType(type);
      const homeSettings = await db.SettingModel.getSettings('home');
      data.automaticallySelectedThreads =
        homeSettings.recommendThreads[type].automaticallySelectedThreads;
    } else if (operation === 'updateHomeHotColumns') {
      await db.ColumnModel.updateHomeHotColumns();
      const hotColumns = await db.ColumnModel.getHotColumns();
      data.poolColumns = hotColumns.poolColumns;
    } else if (operation === 'saveRecommendThreads') {
      const { type, options } = body;
      if (!['fixed', 'movable'].includes(type)) {
        ctx.throw(500, `数据类型错误 type: ${type}`);
      }
      if (
        !['manual', 'automatic', 'all', 'null'].includes(options.displayType)
      ) {
        ctx.throw(400, '请选择显示类型');
      }
      if (!['fixed', 'random'].includes(options.order)) {
        ctx.throw(400, '请选择显示方式');
      }
      checkNumber(options.count, {
        name: '总推荐条数',
        min: 1,
      });
      checkNumber(options.automaticProportion, {
        name: '比例（手动:自动）',
        min: 0.01,
        fractionDigits: 2,
      });
      checkNumber(options.timeInterval, {
        name: '更新间隔',
        min: 0.01,
        fractionDigits: 2,
      });
      checkNumber(options.automaticCount, {
        name: '自动推荐文章数量',
        min: 1,
      });
      checkNumber(options.timeOfPost.min, {
        name: '文章发表最小时间',
        min: 0,
        fractionDigits: 2,
      });
      checkNumber(options.timeOfPost.max, {
        name: '文章发表最大时间',
        min: 0,
        fractionDigits: 2,
      });
      checkNumber(options.countOfPost.min, {
        name: '文章最小回复数量',
        min: 0,
      });
      checkNumber(options.countOfPost.max, {
        name: '文章最大回复数量',
        min: 0,
      });
      if (options.timeOfPost.min >= options.timeOfPost.max) {
        ctx.throw(400, '文章发表时间设置不正确');
      }
      if (options.countOfPost.min >= options.countOfPost.max) {
        ctx.throw(400, '文章回复数量设置不正确');
      }
      checkNumber(options.postVoteUpMinCount, {
        name: '最小点赞数',
        min: 0,
      });
      checkNumber(options.postVoteDownMaxCount, {
        name: '最大点踩数',
        min: 0,
      });
      checkNumber(options.threadVoteUpMinCount, {
        name: '最小点赞数（包含回复）',
        min: 0,
      });
      options.original = !!options.original;
      options.digest = !!options.digest;
      options.reportedAndUnReviewed = !!options.reportedAndUnReviewed;
      options.flowControl = !!options.flowControl;
      options.manuallySelectedThreads.map((t) => {
        const { tid, title, cover } = t;
        if (!tid) {
          ctx.throw(400, '文章数据错误');
        }
        if (!cover) {
          ctx.throw(400, '文章封面不能为空');
        }
        checkString(title, {
          name: '文章标题',
          minLength: 1,
        });
      });
      options.automaticallySelectedThreads.map((t) => {
        const { tid, title } = t;
        if (!tid) {
          ctx.throw(400, '文章数据错误');
        }
        // if(!cover) ctx.throw(400, '文章封面不能为空');
        checkString(title, {
          name: '文章标题',
          minLength: 1,
        });
      });
      const obj = {};
      obj[`c.recommendThreads.${type}`] = options;
      await db.SettingModel.updateOne(
        { _id: 'home' },
        {
          $set: obj,
        },
      );
    } else if (operation === 'saveRecommendForums') {
      const { forumsId } = body;
      for (const fid of forumsId) {
        const forum = await db.ForumModel.findOne({ fid });
        if (!forum) {
          ctx.throw(400, `未找到ID为${fid}的专业`);
        }
      }
      await db.SettingModel.updateOne(
        { _id: 'home' },
        {
          $set: {
            'c.recommendForumsId': forumsId,
          },
        },
      );
    } else if (operation === 'saveColumns') {
      const {
        columnsId,
        poolColumnsId,
        columnListPosition,
        columnCount,
        columnPool,
        columnListSort,
      } = body;
      if (!['main', 'side', 'null'].includes(columnListPosition)) {
        ctx.throw(400, `首页专栏显示位置设置错误`);
      }
      if (!['updateTime', 'postCount'].includes(columnListSort)) {
        ctx.throw(400, `专栏列表排序方式设置错误`);
      }
      checkNumber(columnPool.columnCount, {
        name: '自动推荐-专栏数量',
        min: 0,
      });
      checkNumber(columnPool.updateInterval, {
        name: '自动推荐-更新间隔',
        min: 0,
        fractionDigits: 2,
      });
      checkNumber(columnPool.minPostCount, {
        name: '自动推荐-最小文章数',
        min: 0,
      });
      checkNumber(columnPool.updateTime, {
        name: '自动推荐-最近更新时间',
        min: 0,
        fractionDigits: 2,
      });
      checkNumber(columnPool.minSubscriptionCount, {
        name: '自动推荐-最小订阅数',
        min: 0,
      });
      for (const columnId of columnsId.concat(poolColumnsId)) {
        const column = await db.ColumnModel.findOne({ _id: columnId });
        if (!column) {
          ctx.throw(400, `未找到ID为${columnId}的专栏`);
        }
      }
      await db.SettingModel.updateOne(
        { _id: 'home' },
        {
          $set: {
            'c.columnsId': columnsId,
            'c.columnListPosition': columnListPosition,
            'c.columnCount': columnCount,
            'c.columnListSort': columnListSort,
            'c.columnPool.columnCount': columnPool.columnCount,
            'c.columnPool.updateInterval': columnPool.updateInterval,
            'c.columnPool.minPostCount': columnPool.minPostCount,
            'c.columnPool.updateTime': columnPool.updateTime,
            'c.columnPool.minSubscriptionCount':
              columnPool.minSubscriptionCount,
            'c.columnPool.columnsId': poolColumnsId,
          },
        },
      );
    } else if (operation === 'saveToppedColumns') {
      let { columnsId } = body;
      const columns = await db.ColumnModel.find(
        { _id: { $in: columnsId } },
        { _id: 1 },
      );
      const columnsIdDB = columns.map((c) => c._id);
      columnsId = columnsId.filter((id) => columnsIdDB.includes(id));
      await db.SettingModel.updateOne(
        { _id: 'home' },
        {
          $set: {
            'c.toppedColumnsId': columnsId,
          },
        },
      );
    } else if (operation === 'saveGoods') {
      const { goodsId, showShopGoods } = body;
      for (const productId of goodsId) {
        const product = await db.ShopGoodsModel.findOne({ productId });
        if (!product) {
          ctx.throw(400, `未找到ID为${productId}的专业`);
        }
      }
      await db.SettingModel.updateOne(
        { _id: 'home' },
        {
          $set: {
            'c.shopGoodsId': goodsId,
            'c.showShopGoods': showShopGoods,
          },
        },
      );
    } else if (operation === 'saveToppedThreads') {
      const { toppedThreadsId, latestToppedThreadsId } = body;
      for (const t of toppedThreadsId.concat(latestToppedThreadsId)) {
        let thread;
        if (t.type === 'thread') {
          thread = await db.ThreadModel.findOne({ tid: t.id });
        } else if (t.type === 'article') {
          thread = await db.ArticleModel.findOnly({ _id: t.id });
        }
        if (!thread) {
          ctx.throw(400, `未找到ID为${t.id}的文章`);
        }
      }
      await db.SettingModel.updateOne(
        { _id: 'home' },
        {
          $set: {
            'c.toppedThreadsId': toppedThreadsId,
            'c.latestToppedThreadsId': latestToppedThreadsId,
          },
        },
      );
    } else if (operation === 'saveOriginalThreadDisplayMode') {
      const { originalThreadDisplayMode } = body;
      await db.SettingModel.updateOne(
        { _id: 'home' },
        {
          $set: {
            'c.originalThreadDisplayMode': originalThreadDisplayMode,
          },
        },
      );
    } else if (operation === 'saveShowHomeForums') {
      let { showHomeForums } = body;
      await db.SettingModel.updateOne(
        { _id: 'home' },
        {
          $set: {
            'c.showHomeForums': showHomeForums,
          },
        },
      );
    } else if (operation === 'saveShowHomeWebApply') {
      let { showHomeWebApply } = body;
      await db.SettingModel.updateOne(
        { _id: 'home' },
        {
          $set: {
            'c.showHomeWebApply': showHomeWebApply,
          },
        },
      );
    } else if (operation === 'saveNavigationButtons') {
      let { navigationButtonsLeft, navigationButtonsRight } = body;
      for (const navigation of [
        ...navigationButtonsLeft,
        ...navigationButtonsRight,
      ]) {
        const { title, url, description, target } = navigation;
        if (!title) {
          ctx.throw(400, '标题不能为空');
        }
        if (!description) {
          ctx.throw(400, '描述不能为空');
        }
        if (!url) {
          ctx.throw(400, '链接不能为空');
        }
        if (!target) {
          navigation.target = '_self';
        }
      }
      const obj = {
        left: navigationButtonsLeft,
        right: navigationButtonsRight,
      };
      await db.SettingModel.updateOne(
        { _id: 'home' },
        {
          $set: {
            'c.navigationButtons': obj,
          },
        },
      );
    }
    await db.SettingModel.saveSettingsToRedis('home');
    await next();
  })
  .put('/showActivityEnter', async (ctx, next) => {
    let { body, data, db } = ctx;
    let { showActivityEnter } = body;
    await db.SettingModel.updateOne(
      { _id: 'home' },
      {
        $set: {
          'c.showActivityEnter': showActivityEnter,
        },
      },
    );
    await db.SettingModel.saveSettingsToRedis('home');
    data.showActivityEnter = showActivityEnter;
    return next();
  })
  .use('/block', blockRouter.routes(), blockRouter.allowedMethods());
module.exports = router;
