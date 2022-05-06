const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {nkcModules, data, db, query} = ctx;
    const {page=0} = query;
    const count = await db.ReviewModel.countDocuments();
    const paging = nkcModules.apiFunction.paging(page, count);
    const documentSources = await db.DocumentModel.getDocumentSources();
    const reviews = await db.ReviewModel.find().sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    const uids = new Set()
    const pids = new Set()
    const tids = new Set();
    const documentsId = new Set();

    reviews.map(r => {
      uids.add(r.uid);
      uids.add(r.handlerId);
      if(r.pid) {
        pids.add(r.pid);
      }
      if(r.tid) {
        tids.add(r.tid);
      }
      if(r.docId) {
        documentsId.add(r.docId);
      }
    });
    const users = await db.UserModel.find({uid: {$in: [...uids]}});
    const posts = await db.PostModel.find({pid: {$in: [...pids]}});
    const documents = await db.DocumentModel.find({
      _id: {
        $in: [...documentsId]
      }
    });
    const documentsUrl = await db.DocumentModel.getDocumentsUrlByDocumentsId([...documentsId]);
    let threads = await db.ThreadModel.find({tid: {$in: [...tids]}});
    const usersObj = {};
    const postsObj = {};
    const threadsObj = {};
    const documentsObj = {};
    documents.map(document => {
      documentsObj[document._id] = document;
    });
    users.map(user => {
      usersObj[user.uid] = user;
    });
    posts.map(post => {
      postsObj[post.pid] = post;
    });
    threads = await db.ThreadModel.extendThreads(threads, {
      category: false,
      lastPost: false,
      lastPostUser: false,
      firstPostResource: false,
      forum: false
    });
    threads.map(thread => {
      threadsObj[thread.tid] = thread;
    });
    data.reviews = [];
    for(let review of reviews) {
      const {uid, handlerId, pid, tid, docId} = review;
      review = review.toObject();

      review.time = nkcModules.tools.timeFormat(review.toc);

      review.typeInfo = '未知';
      const type = review.type.toLowerCase();
      if(type.includes('post')) {
        review.typeInfo = '社区回复/评论';
        review.link = await db.PostModel.getUrl(pid);
      } else if(type.includes('thread')) {
        review.typeInfo = '社区文章';
        review.link = await db.PostModel.getUrl(pid);
      } else if(type.includes('document')) {
        const document = documentsObj[docId];
        switch(document.source) {
          case documentSources.article: {
            review.typeInfo = '独立文章';
            break;
          }
          case documentSources.moment: {
            review.typeInfo = '动态/动态评论';
            break;
          }
          case documentSources.comment: {
            review.typeInfo = '独立文章评论';
            break;
          }
          default: break;
        }
        review.link = documentsUrl[document._id];
      }

      if(review.uid) {
        const user = usersObj[uid];
        review.user = {
          username: user.username,
          uid: user.uid
        };
      }

      if(review.handlerId) {
        const handler = usersObj[handlerId];
        review.handler = {
          username: handler.username,
          uid: handler.uid
        };
      }

      if(review.pid) {
        const post = postsObj[pid];
        review.post = {
          pid: post.pid,
          t: post.t,
          c: post.c,
          toc: post.toc,
          tid: post.tid
        };
      }

      if(review.tid) {
        const thread = threadsObj[tid];
        review.thread = {
          tid: thread.tid,
          toc: thread.toc,
          firstPost: {
            t: thread.firstPost.t,
            c: thread.firstPost.c
          }
        };
      }


      // review.link = `/t/${thread.tid}?page=${step.page}&highlight=${pid}#${pid}`;

      data.reviews.push(review);
    }
    data.paging = paging;
    ctx.template = "experimental/log/review.pug";
    await next();
  });
module.exports = router;
