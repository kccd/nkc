const router = require("koa-router")();
router
  .use("/:_id", async (ctx, next) => {
    const {params, db, data} = ctx;
    const {_id} = params;
    const note = await db.NoteModel.findOne({
      _id,
    });
    if(!note) ctx.throw(404, `未找到ID为${_id}的笔记`);
    data.note = note;
    await next();
  })
  .get("/:_id", async (ctx, next) => {
    const {data, db} = ctx;
    const {note} = data;
    const options = {};
    if(!ctx.permission("managementNote")) {
      options.disabled = false;
      options.deleted = false;
    }
    data.note = await db.NoteModel.extendNote(note, options);
    ctx.template = "note/note.pug";
    await next();
  })
  .use("/:_id/c/:cid", async (ctx, next) => {
    const {params, db, data} = ctx;
    const {cid} = params;
    const {user} = data;
    const noteContent = await db.NoteContentModel.findOne({_id: cid});
    if(!noteContent) ctx.throw(400, `笔记不存在，cid: ${noteContent._id}`);
    if(user.uid !== noteContent.uid) ctx.throw(403, "权限不足");
    if(noteContent.disabled) ctx.throw(400, "笔记已被屏蔽");
    if(noteContent.deleted) ctx.throw(400, "笔记已被删除");
    data.noteContent = noteContent;
    await next();
  })
  .patch("/:_id/c/:cid", async (ctx, next) => {
    // 修改笔记内容
    const {data, body, nkcModules, db} = ctx;
    const {noteContent} = data;
    const {checkString} = nkcModules.checkData;
    const {content} = body;
    checkString(content, {
      name: "笔记内容",
      minLength: 1,
      maxLength: 1000
    });
    await noteContent.cloneAndUpdateContent(content);
    noteContent.content = content;
    const nc = await db.NoteContentModel.extendNoteContent(noteContent);
    data.noteContentHTML = nc.html;
    await next();
  })
  .del("/:_id/c/:cid", async (ctx, next) => {
    // 用户删除
    const {data} = ctx;
    const {noteContent} = data;
    await noteContent.update({deleted: true});
    await next();
  })
  .post("/", async (ctx, next) => {
    const {db, body, data, nkcModules} = ctx;
    const {checkString} = nkcModules.checkData;
    const {_id, targetId, content, type, node} = body;
    const {user} = data;
    checkString(content, {
      name: "笔记内容",
      minLength: 1,
      maxLength: 1000
    });

    let cv = null;

    if(type === "post") {
      const post = await db.PostModel.findOnly({pid: targetId}, {cv: 1});
      cv = post.cv;
    }

    const time = Date.now();

    let note;

    if(_id) {
      note = await db.NoteModel.findOne({_id});
      if(!note) ctx.throw(400, `笔记ID错误，请重试。id:${_id}`);
    } else if(node) {
      const {offset, length} = node;
      note = await db.NoteModel.findOne({
        cv,
        targetId,
        type,
        "node.offset": offset,
        "node.length": length
      });
    }

    if(!note) {
      // 新建
      let quoteContent = node.content;
      note = db.NoteModel({
        _id: await db.SettingModel.operateSystemID("notes", 1),
        uid: user.uid,
        type,
        content: quoteContent,
        cv,
        targetId,
        node
      });
      await note.save();
    }

    const noteContent = await db.NoteContentModel({
      _id: await db.SettingModel.operateSystemID("noteContent", 1),
      toc: time,
      uid: user.uid,
      content,
      type,
      targetId,
      noteId: note._id
    });
    await noteContent.save();
    data.noteContent = await db.NoteContentModel.extendNoteContent(noteContent);
    data.noteContent.edit = false;
    data.note = await db.NoteModel.extendNote(note);
    await next();
  });
module.exports = router;