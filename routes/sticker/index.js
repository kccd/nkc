const router = require("koa-router")();
router
  .get("/", async (ctx, next) => {
    const {query, state, data, db, nkcModules} = ctx;
    const {user} = data;
    const {t, page, perpage} = query;
    data.t = t;
    const stickerSettings = await db.SettingModel.getSettings("sticker");
    data.notesAboutUploading = stickerSettings.notesAboutUploading;
    if(t === "upload") {
      ctx.template = "stickers/upload/upload.pug";
    } else {
      const q = {
        uid: user.uid,
        disabled: false,
        deleted: false
      };
      const count = await db.StickerModel.count(q);
      let limit, paging;
      if(perpage) {
        limit = Number(perpage);
      }
      if(!limit) {
        paging = nkcModules.apiFunction.paging(page, count, 55);
      } else {
        paging = nkcModules.apiFunction.paging(page, count, limit);
      }
      
      data.stickers = await db.StickerModel.find(q).sort({order: -1}).skip(paging.start).limit(paging.perpage);
      data.stickers.map(s => {
        s.reason = s.reason.replace("\n", "");
      });
      data.hotStickers = await db.StickerModel.find({
        from: "upload",
        shared: true,
        disabled: false,
        deleted: false,
        // uid: {$ne: user.uid}
      }).sort({hits: -1}).limit(22);
      data.paging = paging;
      data.emoji = state.twemoji;
      ctx.template = "stickers/sticker.pug";
    }
    await next();
  })
  .post("/", async (ctx, next) => {
    const {db, body, data} = ctx;
    const {type, stickersId} = body;
    if(type === "delete") {
      await db.StickerModel.updateMany({
        uid: data.user.uid,
        _id: {$in: stickersId},
        deleted: false
      }, {
        $set: {
          deleted: true
        }
      });
    } else if(type === "move") {
      for(const _id of stickersId.reverse()) {
        const sticker = await db.StickerModel.findOne({uid: data.user.uid, _id});
        if(!sticker) continue;
        const order = await db.StickerModel.getNewOrder(data.user.uid);
        await sticker.update({order});
      }
    } else if(type === "collection") {
      for(const _id of stickersId) {
        const sticker = await db.StickerModel.findOne({_id, from: "upload", shared: true});
        if(!sticker || sticker.tUid === data.user.uid) continue;
        await db.StickerModel.collectionSticker(sticker, data.user.uid);
      }
    } else if(type === "share") {
      for(const _id of stickersId) {
        const sticker = await db.StickerModel.findOne({_id, from: "upload", tUid: data.user.uid, shared: false});
        if(!sticker) continue;
        // 更改审核状态，管理员后台可见
        await sticker.update({
          reviewed: null
        });
      }
    }
    await next();
  })
  .get("/:rid", async (ctx, next) => {
    const {params, db, query, data} = ctx;
    const {rid} = params;
    const {t} = query;
    let sticker = await db.StickerModel.findOnly({from: "upload", rid});
    if(!sticker) ctx.throw(404, "表情不存在");
    if(sticker.disabled) ctx.throw(403, "表情已被屏蔽");
    
    if(t === "json") {
      sticker = sticker.toObject();
      sticker.targetUser = await db.UserModel.findOne({uid: sticker.tUid}, {username: 1, avatar: 1, uid: 1});
      if(data.user) {
        sticker.collected = await db.StickerModel.getCollectSticker(sticker.rid, data.user.uid);
      }
      data.sticker = sticker;
    } else {
      const resource = await db.ResourceModel.findOnly({rid, type: "sticker", mediaType: "mediaPicture"});
      ctx.filePath = await resource.getFilePath();
      ctx.resource = resource;
      ctx.type = resource.ext;
    }
    await next();
  });
module.exports = router;