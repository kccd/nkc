const router = require("koa-router")();
router
  .get("/", async (ctx, next) => {
    const {data, db, query, nkcModules} = ctx;
    data.nav = "sticker";
    const {page, t} = query;
    data.t = t;
    const q = {
      from: "upload"
    };
    if(t === "unReviewed") {
      q.reviewed = null;
      q.shared = false;
    } else if(t === "reviewed") {
      q.reviewed = {$ne: null};
    } else if(t === "unShared") {
      q.shared = false;
      q.reviewed = true;
    } else if(t === "shared") {
      q.shared = true;
    } else if(t === "disabled") {
      q.disabled = true;
    }
    const count = await db.StickerModel.countDocuments(q);
    const paging = nkcModules.apiFunction.paging(page, count, 100);
    let stickers = await db.StickerModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    data.stickers = [];
    for(const s of stickers) {
      const sticker = s.toObject();
      sticker.user = await db.UserModel.findOne({uid: sticker.uid});
      data.stickers.push(sticker);
    }
    data.paging = paging;
    ctx.template = "nkc/sticker/sticker.pug";
    await next();
  })
  .post("/", async (ctx, next) => {
    const {body, db, nkcModules, tools} = ctx;
    const {stickers, type, disabled} = body;
    if(type === "review") {
      for(const s of stickers) {
        nkcModules.checkData.checkString(s.reason, {
          name: "原因",
          minLength: 0,
          maxLength: 500
        });
        const sticker = await db.StickerModel.findOne({
          from: "upload",
          _id: s._id,
          shared: false,
          reviewed: null
        });
        if(!sticker) continue;
        await sticker.updateOne({
          shared: !!s.status,
          reviewed: !!s.status,
          reason: s.reason
        });
        const {rid} = sticker;
        const {size} = s;
        if(!["xs", "sm"].includes(size)) continue;
        const resource = await db.ResourceModel.findOne({rid});
        if(!resource) continue;
        const stickerPath = await resource.getFilePath();
        await tools.imageMagick.stickerify(stickerPath, size==="xs"?30:60);
      }
    } else if(type === "disable") {
      for(const s of stickers) {
        const sticker = await db.StickerModel.findOne({
          from: "upload",
          _id: s._id
        });
        if(!sticker) continue;
        await sticker.updateOne({
          disabled: !!disabled
        });
      }
    } else if(type === "modifySize") {
      for(const s of stickers) {
        const {_id, size} = s;
        const sticker = await db.StickerModel.findOne({
          _id,
          from: "upload",
          reviewed: {$ne: null}
        });
        if(!sticker) continue;
        if(!["md", "sm", "xs"].includes(size)) continue;
        const resource = await db.ResourceModel.findOne({rid: sticker.rid});
        if(!resource) continue;
        const stickerPath = await resource.getFilePath();
        await tools.imageMagick.stickerify(stickerPath, {
          "md": 100,
          "sm": 60,
          "xs": 30
        }[size]);
      }
    }
    await next();
  });
module.exports = router;