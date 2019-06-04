const Router = require('koa-router');
const latestRouter = new Router();
latestRouter
	.get('/', async (ctx, next) => {
		const {data, db, query, state} = ctx;
		const {pageSettings} = state;
    const {forum} = data;
		let {page, s, cat, d} = query;
		page = page?parseInt(page): 0;
		// 构建查询条件
		const match = {};
		// 获取加精文章
		if(d) {
			match.digest = true;
			data.d = d;
		}
		// 加载某个类别的文章
		if(cat) {
			match.categoriesId = parseInt(cat);
			data.cat = match.categoriesId;
		}
		// 拿到该专业下可从中拿文章的所有子专业id
		let fidOfCanGetThreads = await db.ForumModel.getThreadForumsId(data.userRoles, data.userGrade, data.user, forum.fid);
    fidOfCanGetThreads.push(forum.fid);

    // 构建置顶文章查询条件
    const toppedThreadMatch = {
      topped: true,
      reviewed: true,
      mainForumsId: forum.fid,
      disabled: false
    };
    if(forum.fid === "recycle") {
      delete toppedThreadMatch.disabled;
    }
    // 加载、拓展置顶文章
    const toppedThreads = await db.ThreadModel.find(toppedThreadMatch).sort({tlm: -1});

    data.toppedThreads = await db.ThreadModel.extendThreads(toppedThreads, {
      htmlToText: true
    });

    const topThreadsId = toppedThreads.map(t => t.tid);

		match.mainForumsId = {$in: fidOfCanGetThreads};
		match.tid = {$nin: topThreadsId};
		if(forum.fid !== "recycle") {
      match.disabled = false;
    }
    if(data.user) {
      if(!ctx.permission("superModerator")) {
        const canManageFid = await db.ForumModel.canManagerFid(data.userRoles, data.userGrade, data.user);
        match.$or = [
          {
            reviewed: true
          },
          {
            reviewed: false,
            uid: data.user.uid
          },
          {
            reviewed: false,
            mainForumsId: {$in: canManageFid}
          }
        ]
      }
    } else {
      match.reviewed = true;
    }
		const count = await db.ThreadModel.count(match);
		const {apiFunction} = ctx.nkcModules;
		const paging = apiFunction.paging(page, count, pageSettings.forumThreadList);
		data.paging = paging;
		const limit = paging.perpage;
		const skip = paging.start;
		let sort;
		if(s === "toc") {
      sort = {toc: -1};
    } else {
      sort = {tlm: -1};
    }
    data.s = s;
    let threads = await db.ThreadModel.find(match).sort(sort).skip(skip).limit(limit);

		threads = await db.ThreadModel.extendThreads(threads, {
		  category: true,
      htmlToText: true
    });


    const superModerator = ctx.permission("superModerator");
    let canManageFid = [];
    if(data.user) {
      canManageFid = await db.ForumModel.canManagerFid(data.userRoles, data.userGrade, data.user);
    }
    data.threads = [];
    for(const thread of threads) {
      if(forum.fid === "recycle") {
        // 为了在访问回收站时隐藏"已屏蔽，仅自己可见";
        thread.disabled = false;
      }
      if (thread.recycleMark) {
        // 根据权限过滤掉 屏蔽、退修的内容
        if (data.user) {
          // 不具有特殊权限且不是自己
          if (!superModerator) {
            const mainForumsId = thread.mainForumsId;
            let has = false;
            for (const fid of mainForumsId) {
              if (canManageFid.includes(fid)) {
                has = true;
              }
            }
            if (!has) continue;
          }
        } else {
          continue;
        }
      }
      data.threads.push(thread);
    }

    data.type = 'latest';
    data.isFollow = data.user && data.forum.followersId.includes(data.user.uid);
		await next();
	});
module.exports = latestRouter;