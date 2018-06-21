const Router = require('koa-router');
const homeRouter = new Router();
const nkcModules = require('../../nkcModules');
const apiFn = nkcModules.apiFunction;
homeRouter
	.get('/', async (ctx, next) => {
		const {data, db, query, nkcModules} = ctx;

		// 删除退修超时的帖子
		// 取出全部被标记的帖子
		const allMarkthreads = await db.ThreadModel.find({ "recycleMark": true, "fid": { "$nin": ["recycle"] } })
		for (var i in allMarkthreads) {
			const delThreadLog = await db.DelPostLogModel.findOne({ "postType": "thread", "threadId": allMarkthreads[i].tid, "toc": {$lt: Date.now() - 3*24*60*60*1000}})
			if(delThreadLog){
				await allMarkthreads[i].update({ "recycleMark": false, fid: "recycle" })
				await db.PostModel.updateMany({"tid":allMarkthreads[i].tid},{$set:{"fid":"recycle"}})
				await db.DelPostLogModel.updateMany({"postType": "thread", "threadId": allMarkthreads[i].tid},{$set:{"delType":"toRecycle"}})
			}
			// if (delThreadLog.length > 0) {
			//   if (delThreadLog[0].modifyType === false) {
			//     let sysTimeStamp = new Date(delThreadLog[0].toc).getTime()
			//     let nowTimeStamp = new Date().getTime()
			//     let diffTimeStamp = parseInt(nowTimeStamp) - parseInt(sysTimeStamp)
			//     let hourTimeStamp = 3600000 * 72;
			//     let lastTimestamp = parseInt(new Date(delThreadLog[0].toc).getTime()) + hourTimeStamp;
			//     if (diffTimeStamp > hourTimeStamp) {
			//       await allMarkthreads[i].update({ "recycleMark": false, fid: "recycle" })
			//     }
			//   }
			// } else {
			//   await allMarkthreads[i].update({ "recycleMark": false, fid: "recycle" })
			// }
		}
		const {digest, sortby, page = 0} = query;
		const gradeId = data.userGrade._id;
		const rolesId = data.userRoles.map(r => r._id);
		const options = {
			gradeId,
			rolesId,
			uid: data.user?data.user.uid:''
		};
		const fidOfCanGetThreads = await db.ForumModel.fidOfCanGetThreads(options);
		const q = {
			fid: {$in: fidOfCanGetThreads}
		};
		if(digest) {
			q.digest = true;
			data.digest = true;
		}
		// 判断能否显示被退回的文章
		if(!data.userOperationsId.includes('displayRecycleMarkThreads')) {
			if(!data.user) {
				q.recycleMark = {$ne: true};
			} else {
				q.$or = [
					{
						recycleMark: {$ne: true}
					},
					{
						recycleMark: true,
						uid: data.user.uid
					}
				]
			}
		}
		const sort = {};
		if(sortby === 'toc') {
			sort.toc = -1;
			data.sortby = 'toc';
		} else {
			sort.tlm = -1;
		}
		const threadCount = await db.ThreadModel.count(q);
		const paging = nkcModules.apiFunction.paging(page, threadCount);
		data.paging = paging;
		// 加载文章
		const threads = await db.ThreadModel.find(q).sort(sort).skip(paging.start).limit(paging.perpage);
		data.threads = [];
		data.threads = await Promise.all(threads.map(async thread => {
			await thread.extendFirstPost().then(p => p.extendUser());
			if(thread.lm) {
				await thread.extendLastPost().then(p => p.extendUser());
			} else {
				thread.lastPost = thread.firstPost;
			}
			await thread.extendForum();
			await thread.forum.extendParentForum();
			return thread;
		}));

		// 导航
		const threadTypes = await db.ThreadTypeModel.find({}).sort({order: 1});
		const forums = await db.ForumModel.visibleForums(options);
		data.forums = nkcModules.dbFunction.forumsListSort(forums, threadTypes);


		data.homeSettings = await db.SettingModel.findOnly({type: 'home'});
		data.pageSettings = await db.SettingModel.findOnly({type: 'page'});

		// 公告
		data.noticeThreads = [];
		for(const oc of data.homeSettings.noticeThreadsId) {
			const thread = await db.ThreadModel.findOne({oc});
			if(thread) {
				await thread.extendFirstPost().then(p => p.extendUser());
				data.noticeThreads.push(thread);
			}
		}

		// 首页置顶
		data.ads = [];
		for(const tid of data.homeSettings.ads) {
			const thread = await db.ThreadModel.findOne({tid});
			if(thread) {
				await thread.extendFirstPost().then(p => p.extendUser());
				await thread.extendForum();
				data.ads.push(thread);
			}
		}

		// 加精文章
		data.digestThreads = [];
		// const digestThreads = await db.ThreadModel.find({fid: {$in: fidOfCanGetThreads}, digest: true}).limit(10);
		const digestThreads = await db.ThreadModel.aggregate([
			{
				$match: {
					fid: {
						$in: fidOfCanGetThreads
					},
					digest: true
				}
			},
			{
				$sample: {
					size: 10
				}
			}
		]);
		for(const thread of digestThreads) {
			const firstPost = await db.PostModel.findOne({pid: thread.oc});
			if(!firstPost) {
				continue;
			} else {
				await firstPost.extendUser();
				thread.firstPost = firstPost;
			}
			thread.forum = await db.ForumModel.findOne({fid: thread.fid});
			if(thread.forum) {
				await thread.forum.extendParentForum();
			}
			data.digestThreads.push(thread);
		}

		// 活跃用户
		const { home } = ctx.settings;
		const activeUsers = await db.ActiveUserModel.find().sort({ vitality: -1 }).limit(home.activeUsersLength);
		await Promise.all(activeUsers.map(activeUser => activeUser.extendUser()));
		data.activeUsers = activeUsers;

		// 关注的用户
		if(data.user) {
			data.userSubscribe = await db.UsersSubscribeModel.findOnly({uid: data.user.uid});
		}
		data.navbar = { highlight: 'latest' };
		ctx.template = 'home/index.pug';
		await next();
	});
 /* .post('/', async (ctx, next) => {
    const { data, db, query } = ctx;
    const gradeId = data.userGrade._id;
    const rolesId = data.userRoles.map(r => r._id);
    const options = {
    	gradeId,
	    rolesId,
	    uid: data.user?data.user.uid: ''
    };
    const fidOfCanGetThreads = await db.ForumModel.fidOfCanGetThreads(options);
    const { digest, sortby } = query;
    if (data.userRoles.includes('banned')) {
      ctx.throw(403, '您的账号已被封禁，请退出登录后重新注册。');
    }
    const page = query.page || 0;
    const q = {
      fid: { $in: fidOfCanGetThreads}
    };
    if (digest === 'true') q.digest = true;
    const threadCount = await db.ThreadModel.count(q);
    let { $skip, $limit, $match, $sort } = apiFn.getQueryObj(query, q);
    // // 主页过滤掉退回标记的帖子
    // $match.recycleMark = {"$nin":[true]}
    data.paging = apiFn.paging(page, threadCount);
    // 删除退修超时的帖子
    // 取出全部被标记的帖子
    const allMarkthreads = await db.ThreadModel.find({ "recycleMark": true, "fid": { "$nin": ["recycle"] } })
    for (var i in allMarkthreads) {
      const delThreadLog = await db.DelPostLogModel.findOne({ "postType": "thread", "threadId": allMarkthreads[i].tid, "toc": {$lt: Date.now() - 3*24*60*60*1000}})
      if(delThreadLog){
        await allMarkthreads[i].update({ "recycleMark": false, fid: "recycle" })
        await db.PostModel.updateMany({"tid":allMarkthreads[i].tid},{$set:{"fid":"recycle"}})
        await db.DelPostLogModel.updateMany({"postType": "thread", "threadId": allMarkthreads[i].tid},{$set:{"delType":"toRecycle"}})
      }
      // if (delThreadLog.length > 0) {
      //   if (delThreadLog[0].modifyType === false) {
      //     let sysTimeStamp = new Date(delThreadLog[0].toc).getTime()
      //     let nowTimeStamp = new Date().getTime()
      //     let diffTimeStamp = parseInt(nowTimeStamp) - parseInt(sysTimeStamp)
      //     let hourTimeStamp = 3600000 * 72;
      //     let lastTimestamp = parseInt(new Date(delThreadLog[0].toc).getTime()) + hourTimeStamp;
      //     if (diffTimeStamp > hourTimeStamp) {
      //       await allMarkthreads[i].update({ "recycleMark": false, fid: "recycle" })
      //     }
      //   }
      // } else {
      //   await allMarkthreads[i].update({ "recycleMark": false, fid: "recycle" })
      // }
    }
    if(!data.userOperationsId.includes('displayRecycleMarkThreads')) {
      if(!data.user) {
        $match.recycleMark = {$ne: true};
      } else {
        $match.$or = [
          {
            recycleMark: {$ne: true}
          },
          {
            recycleMark: true,
            uid: data.user.uid
          }
        ]
      }
    }
    const threads = await db.ThreadModel.find($match).sort($sort).skip($skip).limit($limit);
    // const threads = [];

    // if (ctx.data.userLevel > 5) {
    //   for (let i in threads1) {
    //     threads.push(threads1[i])
    //   }
    // } else if (ctx.data.userLevel <= 0) {
    //   for (let i in threads1) {
    //     if (threads1[i].recycleMark === true) {
    //       continue;
    //     }
    //     threads.push(threads1[i])
    //   }
    // } else {
    //   for (let i in threads1) {
    //     if (threads1[i].uid !== ctx.data.user.uid && threads1[i].recycleMark === true) {
    //       continue;
    //     }
    //     threads.push(threads1[i])
    //   }
    // }

    /!*if(ctx.data.userLevel === 0){
      for(var i in threads1){
        if(threads1[i].recycleMark === true){
          continue;
        }
        threads.push(threads1[i])
      }
    }else{
      for(var i in threads1){
        if(threads1[i].uid !== ctx.data.user.uid && threads1[i].recycleMark === true){
          continue;
        }
        threads.push(threads1[i])
      }
    }*!/


    for (let i = 0; i < threads.length; i++) {
      const t = threads[i];
      await t.extendFirstPost().then(p => p.extendUser());
      await t.firstPost.extendResources();
      await t.extendLastPost();
      if (t.lastPost) {
        await t.lastPost.extendUser();
      } else {
        threads.splice(i, 1);
      }
      await t.extendForum();
      await t.forum.extendParentForum();
    }

    data.indexThreads = threads;
    const forums = await db.ForumModel.visibleForums(options);
    data.forumList = [];
    await Promise.all(forums.map(async forum => {
			if(forum.parentId !== '') return;
			data.forumList.push(forum);
    }));
    data.digest = digest;
    data.sortby = sortby;
    data.navbar = { highlight: 'latest' };
    data.content = 'forum';
    if (data.user)
      data.userThreads = await data.user.getUsersThreads();
    const { home } = ctx.settings;
    const activeUsers = await db.ActiveUserModel.find().sort({ vitality: -1 }).limit(home.activeUsersLength);
    await Promise.all(activeUsers.map(activeUser => activeUser.extendUser()));
    data.activeUsers = activeUsers;
    ctx.template = 'interface_home.pug';
    await next()
  });*/

module.exports = homeRouter;