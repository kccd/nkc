const router = require("koa-router")();
router
  .get("/", async (ctx, next) => {
    const {nkcModules, query, db, data} = ctx;
    const {page = 0, perpage = 120} = query;
    const q = {
      disabled: false,
      deleted: false,
      shared: true
    };
    const count = await db.StickerModel.count(q);
    const paging = nkcModules.apiFunction.paging(page, count, Number(perpage));
    data.stickers = await db.StickerModel.find(q).sort({hits: -1}).skip(paging.start).limit(paging.perpage);
    data.paging = paging;
    ctx.template = "stickers/stickers.pug";
    await next();
  });
module.exports = router;