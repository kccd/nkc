const Router = require('koa-router');
const router = new Router();

router
  .post('/', async (ctx, next) => {
    const {db, data, nkcModules} = ctx;
    const {originPost, targetPost} = data;

    const _originPost = originPost.toObject();

    await db.HistoriesModel.createHistory(_originPost);

    const {
      t, c, l,
      iplm, uidlm,
      abstractEn, abstractCn,
      keyWordsEn, keyWordsCn,
      authorInfos
    } = targetPost;
    const notes = await db.NoteModel.getNotesByPost(targetPost);
    originPost.c = nkcModules.nkcRender.markNotes.setMark(c, notes.notes);
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
    await originPost.save();
    data.url = await db.PostModel.getUrl(originPost.pid, true);
    await next();
  });

module.exports = router;