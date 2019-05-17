const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const time = Date.now();
    const {db, data, query, nkcModules} = ctx;
    let {page=0, t, c, d} = query;
    const {user} = data;
    if(c) c = decodeURIComponent(c);
    data.c = c;
    data.t = t;
    data.d = d;
    let options;

    if(d) {
      try{
        options = JSON.parse(decodeURIComponent(Buffer.from(d, "base64").toString()));
        const {fid} = options;
        if(fid && fid.length > 0) {
          data.selectedForums = await db.ForumModel.find({fid: {$in: fid}});
        }
      } catch(err) {
        console.log(err)
      }
    }

    if(options) {
      options.page = page;
    } else {
      options = {
        page: page
      };
    }


    let results = [];
    data.results = [];

    const fidOfCanGetThreads = await db.ForumModel.getThreadForumsId(
      data.userRoles,
      data.userGrade,
      user
    );

    // 若用户没有选择筛选专业，则默认从用户能进的专业搜索
    // 若用户选择了筛选专业，则加载用户已选专业的所有子专业，并过滤掉用户不能访问的专业。
    if(options.fid && options.fid.length > 0) {
      let allFid = [];
      for(const id of options.fid) {
        allFid.push(id);
        allFid = allFid.concat(await db.ForumModel.getAllChildForumsIdByFid(id));
      }
      options.fid = (allFid).filter(id => fidOfCanGetThreads.includes(id));
    } else {
      options.fid = fidOfCanGetThreads;
    }

    // 加载分页设置
    const {searchThreadList, searchAllList, searchPostList, searchUserList} = (await db.SettingModel.findById("page")).c;

    if(c) {
      // 搜索结果
      results = await nkcModules.elasticSearch.search(t, c, options);
      // 总匹配数
      data.total = results.hits.total;
      results = results.hits.hits.map(r => {
        console.log(r._score);
        const resource = r._source;
        resource.highlight = r.highlight;
        return resource;
      });
      // 根据分页设置，计算分页
      let perpage;
      if(t === "user") {
        perpage = searchUserList;
      } else if(t === "post") {
        perpage = searchPostList;
      } else if(t === "thread") {
        perpage = searchThreadList;
      } else {
        perpage = searchAllList;
      }
      data.paging = nkcModules.apiFunction.paging(page, data.total, perpage);
    }

    // 如果搜索结果不为空
    if(results && results.length > 0) {
      data.paging = nkcModules.apiFunction.paging(page, data.total, searchThreadList);
      const postObj = {}, threadObj = {}, userObj = {};
      const pids = new Set();
      const tids = new Set();
      const uids = new Set();
      const highlightObj = {};
      results.map(r => {
        pids.add(r.pid);
        uids.add(r.uid);
        if(r.highlight) {
          if(r.docType === "post" || r.docType === "thread") {
            highlightObj[r.pid + "_title"] = r.highlight.title;
            highlightObj[r.pid + "_content"] = r.highlight.content;
          } else if(r.docType === "user") {
            highlightObj[r.pid + "_username"] = r.highlight.username;
            highlightObj[r.pid + "_description"] = r.highlight.description;
          }

        }

      });
      const posts = await db.PostModel.find({pid: {$in: [...pids]}});

      posts.map(post => {
        tids.add(post.tid);
        post.c = nkcModules.apiFunction.obtainPureText(post.c, true, 200);
        postObj[post.pid] = post;
      });

      const users = await db.UserModel.find({uid: {$in: [...uids]}});

      users.map(user => {
        userObj[user.uid] = user;
      });

      let threads = await db.ThreadModel.find({tid: {$in: [...tids]}});
      threads = await db.ThreadModel.extendThreads(threads, {
        forum: true,
        category: false,
        firstPost: true,
        firstPostUser: true,
        userInfo: false,
        lastPost: false,
        lastPostUser: false,
        firstPostResource: true,
        htmlToText: true,
        count: 200
      });

      threads.map(thread => {
        threadObj[thread.tid] = thread;
      });


      // 根据文档类型，拓展数据
      for(const r of results) {
        const {docType} = r;
        if(docType === "thread" || docType === "post") {

        } else if(docType === "user") {

        }
      }


      loop1:
      for(const pid of [...pids]) {
        const post = postObj[pid];
        if(!post) continue;
        const postUser = userObj[post.uid];
        if(!postUser) continue;
        const thread = threadObj[post.tid];
        if(!thread) continue;
        for(const fid of thread.mainForumsId) {
          if(!fidOfCanGetThreads.includes(fid)) continue loop1;
        }
        let link;
        if(thread.oc === post.pid) {
          link = `/t/${thread.tid}`
        } else {
          const m = {pid: post.pid};
          if(!ctx.permission("displayDisabledPosts")) {
            m.disabled = false;
          }
          const obj = await db.ThreadModel.getPostStep(thread.tid, m);
          link = `/t/${thread.tid}?page=${obj.page}&highlight=${post.pid}#${post.pid}`;
        }

        const forums = thread.forums.map(forum => {
          return {
            displayName: forum.displayName,
            fid: forum.fid
          }
        });

        data.results.push({
          title: highlightObj[post.pid + "_title"] || post.t || thread.firstPost.t,
          link,
          abstract: highlightObj[post.pid + "_content"] || post.abstract || post.c,
          threadTime: thread.toc,
          postTime: post.toc,
          tid: thread.tid,
          threadUser: {
            uid: thread.firstPost.user.uid,
            username: thread.firstPost.user.username
          },
          postUser: {
            uid: postUser.uid,
            username: postUser.username
          },
          forums,
        });
      }
    }
    data.time = Date.now() - time;
    data.forums = await db.ForumModel.getForumsTree(data.userRoles, data.userGrade, data.user);
    ctx.template = "search/search.pug";
    await next();
  });
module.exports = router;