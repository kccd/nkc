const Router = require('koa-router');

const testRouter = new Router();

testRouter
  .get('/', async (ctx, next) => {
    const {data, db, nkcModules, query} = ctx;
    const {page = 0} = query;
    const user = data.user;
    // const user = await db.UserModel.findOne({uid: '10'});
    const fidOfCanGetThreads = await db.ForumModel.getThreadForumsId(
      data.userRoles,
      data.userGrade,
      data.user
    );

    const friends = await db.FriendModel.find({uid: user.uid});
    const friendsId = friends.map(f => f.tUid);

    const userSubscribe = await db.UsersSubscribeModel.findOne({uid: user.uid});
    const subscribeForums = userSubscribe.subscribeForums;
    let subscribeForumsId = [];
    for(const fid of subscribeForums) {
      subscribeForumsId.push(fid);
      const childrenFid = await db.ForumModel.getAllChildrenFid(fid);
      subscribeForumsId = subscribeForumsId.concat(childrenFid);
    }
    const q = {
      fid: {$in: fidOfCanGetThreads},
      $or: [
        // 自己的文章与回复
        {
          uid: user.uid
        },
        // 好友的文章与回复
        {
          uid: {
            $in: friendsId
          }
        },
        // 关注的专业里边的文章与回复
        {
          fid: {
            $in: subscribeForumsId
          }
        }

      ]
    };

    const count = await db.ThreadModel.count(q);
    const paging = nkcModules.apiFunction.paging(page, count);
    data.paging = paging;

    const results = [];
    let threads = await db.ThreadModel.find(q, {uid: 1, tid: 1, toc: 1, oc: 1, lm: 1, tlm: 1, fid: 1, hasCover: 1}).skip(paging.start).limit(paging.perpage).sort({tlm: -1});
    threads = await db.ThreadModel.extendThreads(threads, {
      htmlToText: true
    });

    for(const thread of threads) {
      results.push({
        type: 'thread',
        t: thread.tlm,
        thread
      });
    }

    const arr = [];

    const latestThread = await db.ThreadModel.findOne().sort({toc: -1});
    latestThread.firstPost = await db.PostModel.findOne({pid: latestThread.oc});
    latestThread.lastPost = await db.PostModel.findOne({pid: latestThread.lm});
    const digestThread = await db.ThreadModel.findOne({digest: true}).sort({digestTime: -1});
    digestThread.firstPost = await db.PostModel.findOne({pid: latestThread.oc});
    digestThread.lastPost = await db.PostModel.findOne({pid: latestThread.lm});


    arr.push({
      type: 'latest',
      thread: latestThread,
      t: latestThread.toc
    });
    arr.push({
      type: 'digest',
      thread: digestThread,
      t: digestThread.digestTime
    });


    const chat = await db.CreatedChatModel.find({uid: user.uid});

    await Promise.all(chat.map(async c => {
      if(c.tUid !== user.uid) {
        const message = await db.MessageModel.findOne({_id: c.lmId});
        if(!message) return;
        let sUser, rUser;
        if(message.s === user.uid) {
          sUser = user;
          rUser = await db.UserModel.findOnly({uid: message.r});
        } else {
          rUser = user;
          sUser = await db.UserModel.findOnly({uid: message.s});
        }
        arr.push({
          type: 'message',
          t: message.tc,
          message,
          sUser,
          rUser
        });
      }
    }));

    for(const fid of subscribeForums) {
      const forum = await db.ForumModel.findOne({fid});
      const latestThread = await db.ThreadModel.findOne({fid}).sort({toc: -1});
      if(!latestThread) continue;
      latestThread.firstPost = await db.PostModel.findOne({pid: latestThread.oc});
      latestThread.lastPost = await db.PostModel.findOne({pid: latestThread.lm});

      arr.push({
        type: 'forum',
        t: latestThread.toc,
        forum,
        latestThread
      })
    }

    const hasThread = count > 0;
    const pageCount = paging.pageCount;
    const isFirstPage = paging.page === 0;
    let isLastPage = false;
    if(paging.page + 1 === paging.pageCount) {
      isLastPage = true;
    } else if(paging.page >= paging.pageCount) {
      ctx.throw(400, '分页数超出范围');
    }

    let lastThreadTime;
    if(!isFirstPage) {
      const lastThread = await db.ThreadModel.findOne(q).skip(paging.start-1).limit(1).sort({tlm: -1});
      lastThreadTime = lastThread.tlm;
    }

    // 若文章总页数小于等于1，则将全部的信息按时间排序即可
    // 若文章总页数大于1且当前为第一页，则将大于最后一篇文章时间的信息插入，小于的应参与下一页的排序
    // 若文章总页数大于1且当前不处于第一页，则需先取到上一页最后一篇文章的时间，插入小于该时间大于最后一篇文章的数据。若当前为文章的最后一页，则插入小于最后一篇文章时间的数据。

    // 没有关于文章信息或文章信息只有一页，只需要将全部信息按时间排序即可
    if(!hasThread || pageCount === 0) {
      for(const a of arr) {
        let insert = false;
        if(results.length === 0) {
          results.push(a);
          continue;
        }
        for(let i = 0; i < results.length; i++) {
          const r = results[i];
          if(r.t < a.t) {
            results.splice(i, 0, a);
            insert = true;
            break;
          }
        }
        if(!insert) {
          results.push(a);
        }
      }
    } else if(isFirstPage){ // 文章存在多页，现处于文章的第一页
      for(const a of arr) {
        let insert = false;
        for(let i = 0; i < results.length; i++) {
          const r = results[i];
          if(r.t < a.t) {
            results.splice(i, 0, a);
            insert = true;
            break;
          }
        }
      }
    } else { // 文章存在多页，且现处于中间页，需考虑是否为文章的最后一页
      for(const a of arr) {
        let insert = false;
        for(let i = 0; i < results.length; i++) {
          const r = results[i];
          if(r.t < a.t && a.t <= lastThreadTime) {
            results.splice(i, 0, a);
            insert = true;
            break;
          }
        }
        if(!insert && a.t <= lastThreadTime && isLastPage) {
          results.push(a);
        }
      }
    }

    data.results = results;
    ctx.template = 'test/test.pug';

    const threadTypes = await db.ThreadTypeModel.find({}).sort({order: 1});
    let forums = await db.ForumModel.visibleForums(data.userRoles, data.userGrade, data.user);
    forums = nkcModules.dbFunction.forumsListSort(forums, threadTypes);
    data.forums = forums.map(forum => forum.toObject());

    await next();


  });

module.exports = testRouter;