const Router = require('koa-router');
const { OnlyOperation } = require('../../../middlewares/permission');
const { Operations } = require('../../../settings/operations');
const router = new Router();
router.get(
  '/',
  OnlyOperation(Operations.experimentalReviewLog),
  async (ctx, next) => {
    const { nkcModules, data, db, query } = ctx;
    const { page = 0 } = query;
    const count = await db.ReviewModel.countDocuments();
    const paging = nkcModules.apiFunction.paging(page, count);
    const documentSources = await db.DocumentModel.getDocumentSources();
    const reviewSources = await db.ReviewModel.getDocumentSources();
    // TODO：调用审核service上的方法
    const reviews = await db.ReviewModel.find()
      .sort({ toc: -1 })
      .skip(paging.start)
      .limit(paging.perpage);
    const uids = new Set();
    const pids = new Set();
    const tids = new Set();
    const documentsId = new Set();
    const notesId = new Set();

    reviews.map((r) => {
      uids.add(r.uid);
      uids.add(r.handlerId);
      if (r.source === reviewSources.post) {
        pids.add(r.sid);
      } else if (r.source === reviewSources.document) {
        documentsId.add(r.sid);
      } else if (r.source === reviewSources.note) {
        notesId.add(r.sid);
      }
    });
    const users = await db.UserModel.find({ uid: { $in: [...uids] } });
    const posts = await db.PostModel.find({ pid: { $in: [...pids] } });
    const documents = await db.DocumentModel.find({
      _id: {
        $in: [...documentsId],
      },
    });
    const noteContents = await db.NoteContentModel.find(
      { _id: { $in: [...notesId] } },
      { noteId: 1, _id: 1 },
    );
    const noteIdForNoteContentIdObj = {};
    for (const noteContent of noteContents) {
      noteIdForNoteContentIdObj[noteContent._id] = noteContent.noteId;
    }
    const usersObj = {};
    const postsObj = {};
    const threadsObj = {};
    const documentsObj = {};
    documents.map((document) => {
      documentsObj[document._id] = document;
    });
    users.map((user) => {
      usersObj[user.uid] = user;
    });
    posts.map((post) => {
      postsObj[post.pid] = post;
      tids.add(post.tid);
    });
    let threads = await db.ThreadModel.find({ tid: { $in: [...tids] } });
    threads = await db.ThreadModel.extendThreads(threads, {
      category: false,
      lastPost: false,
      lastPostUser: false,
      firstPostResource: false,
      forum: false,
    });
    threads.map((thread) => {
      threadsObj[thread.tid] = thread;
    });
    data.reviews = [];
    for (let review of reviews) {
      const { uid, handlerId, pid, source, sid } = review;
      review = review.toObject();

      review.time = nkcModules.tools.timeFormat(review.toc);

      review.typeInfo = '未知';
      if (source === reviewSources.post) {
        const post = postsObj[sid];
        if (!post) {
          continue;
        }
        if (post.type === 'thread') {
          review.typeInfo = '论坛文章';
        } else {
          review.typeInfo = '论坛回复/评论';
        }
        review.link = await db.PostModel.getUrl(sid);
      } else if (source === reviewSources.document) {
        const document = documentsObj[sid];
        switch (document.source) {
          case documentSources.article: {
            review.typeInfo = '专栏文章';
            break;
          }
          case documentSources.moment: {
            review.typeInfo = '电文/电文评论';
            break;
          }
          case documentSources.comment: {
            review.typeInfo = '专栏文章评论';
            break;
          }
          default:
            break;
        }
        review.link = nkcModules.tools.getUrl('documentNumber', document.did);
      } else if (source === reviewSources.note) {
        review.typeInfo = '笔记';
        const noteId = noteIdForNoteContentIdObj[sid];
        review.link = nkcModules.tools.getUrl('noteContent', noteId, sid);
      }

      if (review.uid) {
        const user = usersObj[uid];
        review.user = {
          username: user.username,
          uid: user.uid,
        };
      }

      if (review.handlerId) {
        const handler = usersObj[handlerId];
        review.handler = {
          username: handler.username,
          uid: handler.uid,
        };
      }

      if (review.source === reviewSources.post) {
        const post = postsObj[pid];
        if (!post) {
          continue;
        }
        const thread = threadsObj[post.tid];
        if (!thread) {
          continue;
        }
        if (post.type === 'thread') {
          review.thread = {
            tid: thread.tid,
            toc: thread.toc,
            firstPost: {
              t: thread.firstPost.t,
              c: thread.firstPost.c,
            },
          };
        } else {
          review.post = {
            pid: post.pid,
            t: post.t,
            c: post.c,
            toc: post.toc,
            tid: post.tid,
          };
        }
      }

      // review.link = `/t/${thread.tid}?page=${step.page}&highlight=${pid}#${pid}`;

      data.reviews.push(review);
    }
    data.paging = paging;
    ctx.template = 'experimental/log/review.pug';
    await next();
  },
);
module.exports = router;
