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
      disabled: false,
      recycleMark: {$ne: true}
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
		match.recycleMark = {$ne: true};
    if(data.user) {
      if(!data.user.certs.includes("editor")) {
        match.$or = [
          {
            reviewed: true
          },
          {
            reviewed: false,
            uid: data.user.uid
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
		const threads = await db.ThreadModel.find(match).sort(sort).skip(skip).limit(limit);

		data.threads = await db.ThreadModel.extendThreads(threads, {
		  category: true,
      htmlToText: true
    });


		data.type = 'latest';
    data.isFollow = data.user && data.forum.followersId.includes(data.user.uid);
		await next();
	});
module.exports = latestRouter;