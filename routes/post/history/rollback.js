const Router = require('koa-router');
const router = new Router();

router
  .post('/', async (ctx, next) => {
    /*const {pid, _id} = ctx.params;
    const {db, data, nkcModules} = ctx;

    const {PostModel, HistoriesModel, ThreadModel} = db;
    const originPost = await PostModel.findOnly({pid});
    // return console.log(typeof new mongoose.Types.ObjectId(_id))
    let targetPost = await HistoriesModel.findOnly({_id});
    const targetThread = await ThreadModel.findOnly({tid: originPost.tid});
    await targetThread.extendForums(['mainForums', 'minorForums']);
    await targetThread.ensurePermission(data.userRoles, data.userGrade, data.user);*/

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