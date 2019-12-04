const router = require("koa-router")();
router
  .get("/", async (ctx, next) => {
    const {db, data} = ctx;
    data.nav = "home";
    const homeSettings = await db.SettingModel.getSettings("home");
    data.ads = homeSettings.ads;
    data.recommendForumsId = homeSettings.recommendForumsId;
    const forums = await db.ForumModel.find({fid: {$in: data.recommendForumsId}});
    const forumsObj = {};
    forums.map(forum => forumsObj[forum.fid] = forum);
    data.recommendForums = [];
    data.recommendForumsId.map(fid => {
      const forum = forumsObj[fid];
      if(forum) data.recommendForums.push(forum);
    });
    data.columns = [];
    const columns = await db.ColumnModel.find({_id: {$in: homeSettings.columnsId}});
    const columnsObj = {};
    columns.map(c => columnsObj[c._id] = c);
    homeSettings.columnsId.map(cid => {
      const column = columnsObj[cid];
      if(column) data.columns.push(column);
    });
    let goods = await db.ShopGoodsModel.find({disabled: false, productId: {$in: homeSettings.shopGoodsId}});
    goods = await db.ShopGoodsModel.extendProductsInfo(goods, {
      user: true,
      dealInfo: false,
      post: true,
      thread: false
    });
    const goodsObj = {};
    goods.map(g => goodsObj[g.productId] = g);
    data.goods = [];
    homeSettings.shopGoodsId.map(productId => {
      const product = goodsObj[productId];
      if(product) data.goods.push(product);
    });
    let threads = await db.ThreadModel.find({tid: {$in: homeSettings.toppedThreadsId}});
    threads = await db.ThreadModel.extendThreads(threads, {
      forum: false,
      category: false,
      lastPost: false,
      lastPostUser: false,
      firstPost: true,
      firstPostUser: true,
      htmlToText: true
    });
    const threadsObj = {};
    threads.map(thread => threadsObj[thread.tid] = thread);
    data.toppedThreads = [];
    homeSettings.toppedThreadsId.map(tid => {
      const thread = threadsObj[tid];
      if(thread) data.toppedThreads.push(thread);
    });
    ctx.template = "nkc/home.pug";
    await next();
  })
  .post("/", async (ctx, next) => {
    const {nkcModules, body, data} = ctx;
    const {topType} = body.fields;
    const {cover} = body.files;
    await nkcModules.file.saveHomeAdCover(cover, topType);
    data.coverHash = cover.hash;
    await next();
  })
  .patch("/", async (ctx, next) => {
    const {nkcModules, body, db, data} = ctx;
    const {operation} = body;
    if(operation === "saveAds") {
      let {movable, fixed, movableOrder, fixedOrder} = body;
      movableOrder = movableOrder === "random"? "random": "fixed";
      fixedOrder = fixedOrder === "random"? "random": "fixed";
      movable.concat(fixed).map(ad => {
        nkcModules.checkData.checkString(ad.title, {
          name: "标题",
          minLength: 1,
          maxLength: 200
        });
        if(!ad.cover) ctx.throw(400, "封面图不能为空");
        if(!ad.tid) ctx.throw(400, "文章ID不能为空");
      });
      await db.SettingModel.updateOne({_id: "home"}, {
        $set: {
          "c.ads.movable": movable,
          "c.ads.fixed": fixed,
          "c.ads.fixedOrder": fixedOrder,
          "c.ads.movableOrder": movableOrder
        }
      });
    } else if(operation === "saveRecommendForums") {
      const {forumsId} = body;
      for(const fid of forumsId) {
        const forum = await db.ForumModel.findOne({fid});
        if(!forum) ctx.throw(400, `未找到ID为${fid}的专业`);
      }
      await db.SettingModel.updateOne({_id: "home"}, {
        $set: {
          "c.recommendForumsId": forumsId
        }
      });
    } else if(operation === "saveColumns") {
      const {columnsId} = body;
      for(const columnId of columnsId) {
        const column = await db.ColumnModel.findOne({_id: columnId});
        if(!column) ctx.throw(400, `未找到ID为${columnId}的专业`);
      }
      await db.SettingModel.updateOne({_id: "home"}, {
        $set: {
          "c.columnsId": columnsId
        }
      });
    } else if(operation === "saveGoods") {
      const {goodsId} = body;
      for(const productId of goodsId) {
        const product = await db.ShopGoodsModel.findOne({productId});
        if(!product) ctx.throw(400, `未找到ID为${productId}的专业`);
      }
      await db.SettingModel.updateOne({_id: "home"}, {
        $set: {
          "c.shopGoodsId": goodsId
        }
      });
    } else if(operation === "saveToppedThreads") {
      const {toppedThreadsId} = body;
      for(const tid of toppedThreadsId) {
        const thread = await db.ThreadModel.findOne({tid});
        if(!thread) ctx.throw(400, `未找到ID为${tid}的文章`);
      }
      await db.SettingModel.updateOne({_id: "home"}, {
        $set: {
          "c.toppedThreadsId": toppedThreadsId
        }
      });
    }
    await db.SettingModel.saveSettingsToRedis("home");
    await next();
  });
module.exports = router;