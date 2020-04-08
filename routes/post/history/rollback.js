const Router = require('koa-router');
const router = new Router();

router
  .post('/:_id', async (ctx, next) => {
    const {pid, _id} = ctx.params;
    const {db, data, nkcModules} = ctx;

    const {PostModel, HistoriesModel, ThreadModel} = db;
    const originPost = await PostModel.findOnly({pid});
    // return console.log(typeof new mongoose.Types.ObjectId(_id))
    let targetPost = await HistoriesModel.findOnly({_id});
    const targetThread = await ThreadModel.findOnly({tid: originPost.tid});
    await targetThread.extendForums(['mainForums', 'minorForums']);
    await targetThread.ensurePermission(data.userRoles, data.userGrade, data.user);

    const _originPost = originPost.toObject();

    await db.HistoriesModel.createHistory(_originPost);

    const {
      t, c, l,
      iplm, uidlm,
      abstractEn, abstractCn,
      keyWordsEn, keyWordsCn,
      authorInfos
    } = targetPost;
    originPost.c = c;
    originPost.t = t;
    originPost.l = l;
    originPost.abstractEn = abstractEn;
    originPost.abstractCn = abstractCn;
    originPost.keyWordsEn = keyWordsEn;
    originPost.keyWordsCn = keyWordsCn;
    originPost.authorInfos = authorInfos;
    originPost.uidlm = uidlm;
    originPost.iplm = iplm;
    originPost.tlm = Date.now();
    originPost.disableNoteUpdate = true;
    await originPost.save();
    const newCV = originPost.cv;
    // 获取历史版本的笔记选区
    let oldNotes = await db.NoteModel.getNotesByPost(targetPost);
    oldNotes = oldNotes.notes;
    for(let note of oldNotes) {
      note = note.toObject();
      const noteId = note._id;
      delete note.__v;
      delete note.toc;
      delete note._id;
      note._id = await db.SettingModel.operateSystemID("notes", 1);
      note.cv = newCV;
      note = db.NoteModel(note);
      await db.NoteContentModel.updateMany({
        notesId: noteId
      }, {
        $addToSet: {
          notesId: note._id
        }
      });
      await note.save();
    }
    data.url = await db.PostModel.getUrl(originPost.pid, true);
    await next();
  });

module.exports = router;