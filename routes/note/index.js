const router = require("koa-router")();
router
  .post("/", async (ctx, next) => {
    const {db, body, data} = ctx;
    const {pid, notes, nodes} = body;
    const {user} = data;
    const note = db.NoteModel({
      _id: await db.SettingModel.operateSystemID("notes", 1),
      uid: user.uid,
      type: "post",
      targetId: pid,
      notes,
      nodes
    });
    await note.save();
    await next();
  });
module.exports = router;