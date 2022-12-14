const router = require("koa-router")();
router
  .get("/", async (ctx, next) => {
    const {nkcModules, query, db, data, state} = ctx;
    const {page = 0, perpage = 120} = query;
    const q = {
      disabled: false,
      deleted: false,
      shared: true,
      // 加入审核通过条件
      reviewed: true,
    };
    const {
      notesAboutUploading,
      notesAboutUsing,
    } = await db.SettingModel.getSettings('sticker');
    data.notesAboutUploading = notesAboutUploading;
    data.notesAboutUsing = notesAboutUsing;
    const count = await db.StickerModel.countDocuments(q);
    const paging = nkcModules.apiFunction.paging(page, count, Number(perpage));
    const stickers = await db.StickerModel.find(q).sort({hits: -1}).skip(paging.start).limit(paging.perpage);
    let arr= [];
    for (let i = 0; i < stickers.length; i++) {
      const newSticker = stickers[i].toObject();
      newSticker.state = 'usable';
      arr.push(newSticker)
    }
    data.stickers = arr
    data.emoji = state.twemoji;
    data.paging = paging;
    ctx.template = "stickers/stickers.pug";
    await next();
  });
module.exports = router;
