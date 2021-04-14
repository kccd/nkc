const router = require("koa-router")();
router
  .get("/", async (ctx, next) => {
    const {data, db, query, nkcModules} = ctx;
    const {page} = query;
    const match = {

    };
    const count = await db.NoteContentModel.countDocuments(match);
    const paging = nkcModules.apiFunction.paging(page, count);
    const noteContent = await db.NoteContentModel.find(match).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    data.noteContent = await db.NoteContentModel.extendNoteContent(noteContent, {
      extendNote: true
    });
    data.paging = paging;
    data.nav = "note";
    ctx.template = "nkc/note/note.pug";
    await next();
  })
  .post("/", async (ctx, next) => {
    const {body, db, nkcModules, data} = ctx;
    const {noteContentId, type, content} = body;
    const noteContent = await db.NoteContentModel.findOne({_id: noteContentId});
    if(!noteContent) ctx.throw(400, `未找到ID为${noteContentId}的笔记`);
    if(type === "modify") {
      const {checkString} = nkcModules.checkData;
      checkString(content, {
        name: "笔记内容",
        minLength: 1,
        maxLength: 400
      });
      await noteContent.cloneAndUpdateContent(content);
      noteContent.content = content;
      const nc = await db.NoteContentModel.extendNoteContent(noteContent);
      data.noteContentHTML = nc.html;
    } else if(type === "disable") {
      await noteContent.updateOne({disabled: true});
    } else if(type === "cancelDisable") {
      await noteContent.updateOne({disabled: false});
    }
    await next();
  });
module.exports = router;