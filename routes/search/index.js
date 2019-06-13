const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const time = Date.now();
    const {db, data, query, nkcModules} = ctx;
    let {page=0, t, c, d} = query;
    const {user} = data;
    // 通过mongodb精准搜索用户名
    let targetUser, existUser = false;

    if(c) {
      if(!d) {
        data.c = Buffer.from(encodeURIComponent(c)).toString("base64");
        d = Buffer.from(encodeURIComponent(JSON.stringify({a: 1}))).toString("base64");
      } else {
        data.c = c;
        try{
          c = decodeURIComponent(Buffer.from(c, "base64").toString());
        }catch(err) {}
      }
    }
    data.t = t;
    data.d = d;
    let options;

    // 高级搜索参数
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

    // 用户输入了搜索的关键词，进入高级搜索。
    if(c) {
      // 搜索结果
      results = await nkcModules.elasticSearch.search(t, c, options);
      // 总匹配数
      data.total = results.hits.total;
      results = results.hits.hits.map(r => {
        const resource = r._source;
        resource.highlight = r.highlight;
        return resource;
      });



      // 根据分页设置，计算分页
      let perpage;
      if(t === "user") {
        perpage = searchUserList;
        targetUser = await db.UserModel.findOne({usernameLowerCase: c.toLowerCase()});
      } else if(t === "post") {
        perpage = searchPostList;
      } else if(t === "thread") {
        perpage = searchThreadList;
      } else {
        perpage = searchAllList;
        targetUser = await db.UserModel.findOne({usernameLowerCase: c.toLowerCase()});
      }
      data.paging = nkcModules.apiFunction.paging(page, data.total, perpage);

      if(targetUser && Number(page) === 0) {
        data.total++;
        results.unshift({
          uid: targetUser.uid,
          docType: "user",
          username: targetUser.username,
          highlight: {
            username: [`<span style="color: #e85a71;">${targetUser.username}</span>`]
          }
        });
      }

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
            if(r.highlight.content) {
              highlightObj[r.pid + "_content"] = "内容：" + r.highlight.content;
            }
            if(r.highlight.keywordsEN) {
              highlightObj[r.pid + "_keywordsEN"] = "关键词：" + r.highlight.keywordsEN;
            }
            if(r.highlight.keywordsCN) {
              highlightObj[r.pid + "_keywordsCN"] = "关键词：" + r.highlight.keywordsCN;
            }
            if(r.highlight.abstractEN) {
              highlightObj[r.pid + "_abstractEN"] = "Abstract：" + r.highlight.abstractEN;
            }
            if(r.highlight.abstractCN) {
              highlightObj[r.pid + "_abstractCN"] = "摘要：" + r.highlight.abstractCN;
            }
          } else if(r.docType === "user") {
            highlightObj[r.uid + "_username"] = r.highlight.username;
            highlightObj[r.uid + "_description"] = r.highlight.description;
          }

        }

      });
      const posts = await db.PostModel.find({pid: {$in: [...pids]}, reviewed: true});

      posts.map(post => {
        tids.add(post.tid);
        post.c = nkcModules.apiFunction.obtainPureText(post.c, true, 200);
        postObj[post.pid] = post;
      });

      const users = await db.UserModel.find({uid: {$in: [...uids]}});
      users.map(user => {
        userObj[user.uid] = user;
      });

      let threads = await db.ThreadModel.find({tid: {$in: [...tids]}, reviewed: true});
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
      loop1:
      for(const result of results) {
        let r;
        const {docType, pid, uid} = result;
        if(["thread", "post"].includes(docType)) {
          const post = postObj[pid];
          if(!post || post.disabled) continue;
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
            // link = `/t/${thread.tid}?page=${obj.page}&highlight=${post.pid}#${post.pid}`;
            link = await db.PostModel.getUrl(post);
          }

          const forums = thread.forums.map(forum => {
            return {
              displayName: forum.displayName,
              fid: forum.fid
            }
          });

          r = {
            docType,
            link,
            title: highlightObj[`${pid}_title`] || post.t || thread.firstPost.t,
            abstract:
              highlightObj[`${pid}_keywordsEN`] ||
              highlightObj[`${pid}_keywordsCN`] ||
              highlightObj[`${pid}_abstractEN`] ||
              highlightObj[`${pid}_abstractCN`] ||
              highlightObj[`${pid}_content`] ||
              post.abstract || post.c,
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
            forums
          };
        } else {
          if(targetUser && targetUser.uid === uid) {
            if(existUser) continue;
            existUser = true;
          }
          const u = userObj[uid];
          if(!u || (u.certs.includes("banned") && !ctx.permission("bannedUser"))) continue;
          await u.extendGrade();
          await db.UserModel.extendUsersInfo([u]);
          r = {
            docType,
            username: highlightObj[`${uid}_username`] || u.username,
            description: highlightObj[`${uid}_description`] || u.description,
            user: u
          };
        }
        data.results.push(r);
      }
    }
    data.time = Date.now() - time;
    data.forums = await db.ForumModel.getForumsTree(data.userRoles, data.userGrade, data.user);
    ctx.template = "search/search.pug";
    await next();
  });
module.exports = router;