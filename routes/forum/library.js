const { Public, OnlyOperation } = require('../../middlewares/permission');
const { Operations } = require('../../settings/operations');

const router = require('koa-router')();
router
  .get('/', Public(), async (ctx, next) => {
    const { data, db, query } = ctx;
    data.type = 'library';
    const { t, id } = query;
    if (t && id) {
      if (t === 'nav') {
        const library = await db.LibraryModel.findOne({ _id: id });
        if (library) {
          data.folderId = library.lid || '';
          data.tLid = library._id;
        }
      } else if (t === 'upload') {
        let rid = id.split('-');
        const resources = await db.ResourceModel.find(
          { rid: { $in: rid } },
          { rid: 1 },
        );
        data.uploadResourcesId = resources.map((r) => r.rid);
      }
    }

    if (data.forum.lid) {
      const forumLibrary = await db.LibraryModel.findOne({
        _id: data.forum.lid,
      });
      if (forumLibrary && forumLibrary.closed) {
        data.libraryClosed = true;
      }
    }
    const uploadSettings = await db.SettingModel.getSettings('upload');
    const { sizeLimit } = uploadSettings;
    data.sizeLimit = sizeLimit;
    await next();
  })
  .post(
    '/',
    OnlyOperation(Operations.createForumLibrary),
    async (ctx, next) => {
      const { data, db, body } = ctx;
      const { forum } = data;
      const { type } = body;
      if (type === 'create') {
        data.library = await forum.createLibrary(data.user.uid);
      } else {
        if (!forum.lid) {
          ctx.throw(400, '专业暂未开设文库');
        }
        const library = await db.LibraryModel.findOnly({ _id: forum.lid });
        if (!library) {
          ctx.throw(400, `未找到文库, lid: ${forum.lid}`);
        }
        data.library = library;
        if (type === 'open') {
          if (!library.closed) {
            ctx.throw(400, '文库未关闭');
          }
          await library.updateOne({ closed: false });
          data.libraryClosed = false;
        } else {
          if (library.closed) {
            ctx.throw(400, '文库已关闭');
          }
          await library.updateOne({ closed: true });
          data.libraryClosed = true;
        }
      }
      await next();
    },
  );
module.exports = router;
