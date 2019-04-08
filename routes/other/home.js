const Router = require('koa-router');
const homeRouter = new Router();
homeRouter
	.get('/', async (ctx, next) => {
		const {data, db, query, nkcModules} = ctx;
		// 删除退修超时的帖子
		// 取出全部被标记的帖子
		const allMarkThreads = await db.ThreadModel.find({ "recycleMark": true, "fid": { "$nin": ["recycle"] } });
		for (var i in allMarkThreads) {
			const delThreadLog = await db.DelPostLogModel.findOne({ "postType": "thread", "threadId": allMarkThreads[i].tid, "toc": {$lt: Date.now() - 3*24*60*60*1000}})
			if(delThreadLog){
				await allMarkThreads[i].update({ "recycleMark": false, "mainForumsId": ["recycle"] })
				await db.PostModel.updateMany({"tid":allMarkThreads[i].tid},{$set:{"mainForumsId":["recycle"]}})
				await db.DelPostLogModel.updateMany({"postType": "thread", "threadId": allMarkThreads[i].tid},{$set:{"delType":"toRecycle"}})
        const tUser = await db.UserModel.findOne({uid: delThreadLog.delUserId});
        const thread = await db.ThreadModel.findOne({tid: delThreadLog.threadId});
        if(tUser && thread) {
          data.thread = thread;
          await db.KcbsRecordModel.insertSystemRecord('postBlocked', tUser, ctx);
        }
			}
		}
		const {digest, sortby, page = 0} = query;
    let fidOfCanGetThreads = await db.ForumModel.getThreadForumsId(data.userRoles, data.userGrade, data.user);
    const homeSettings = (await db.SettingModel.findOnly({_id: 'home'})).c;
    // 排除话题下的文章
    if(!homeSettings.list || !homeSettings.list.topic) {
      const topics = await db.ForumModel.find({forumType: 'topic'}, {fid: 1});
      const fids = topics.map(t => t.fid);
      fidOfCanGetThreads = fidOfCanGetThreads.filter(fid => !fids.includes(fid));
    }
    // 排除学科下的文章
    if(!homeSettings.list || !homeSettings.list.discipline) {
      const dis = await db.ForumModel.find({forumType: 'discipline'}, {fid: 1});
      const fids = dis.map(t => t.fid);
      fidOfCanGetThreads = fidOfCanGetThreads.filter(fid => !fids.includes(fid));
    }
    data.homeSettings = homeSettings;
		const q = {
			mainForumsId: {$in: fidOfCanGetThreads}
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
    data.threads = await db.ThreadModel.extendThreads(threads, {
      htmlToText: ctx.reqType === 'app'
    });
		// 导航
		const threadTypes = await db.ThreadTypeModel.find({}).sort({order: 1});
    const forums = await db.ForumModel.visibleForums(data.userRoles, data.userGrade, data.user);
		data.forums = nkcModules.dbFunction.forumsListSort(forums, threadTypes);
		data.pageSettings = (await db.SettingModel.findOnly({_id: 'page'})).c;

		// 网站公告
		const noticeThreads = await Promise.all(data.homeSettings.noticeThreadsId.map(async oc => {
      const thread = await db.ThreadModel.findOne({oc});
      if(thread) return thread;
    }));
		data.noticeThreads = await db.ThreadModel.extendThreads(noticeThreads, {
		  forum: false,
      lastPost: false
    });

    // 首页置顶
    const ads = [];
    await Promise.all(data.homeSettings.ads.map(async tid => {
      const thread = await db.ThreadModel.findOne({tid, mainForumsId: {$in: fidOfCanGetThreads}}); 
      if(thread) ads.push(thread);
    }));
    data.ads = await db.ThreadModel.extendThreads(ads, {
      forum: false,
      lastPost: false
    });

		// 加精文章
		data.digestThreads = [];
		const digestThreads = await db.ThreadModel.aggregate([
			{
				$match: {
					mainForumsId: {
						$in: fidOfCanGetThreads
					},
					digest: true
				}
			},
			{
				$sample: {
					size: 10
				}
			},
      {
        $project: {
          _id: 0,
          oc: 1,
          tid: 1,
          mainForumsId: 1
        }
      }
		]);
		data.digestThreads = await db.ThreadModel.extendThreads(digestThreads, {
      lastPost: false,
      parentForum: false
    });

		// 活跃用户
		const { home } = ctx.settings;
		const activeUsers = await db.ActiveUserModel.find().sort({ vitality: -1 }).limit(home.activeUsersLength);
		data.activeUsers = await db.ActiveUserModel.extendUsers(activeUsers);
	
		data.navbar = { highlight: 'latest' };
		ctx.template = 'home/index.pug';
		await next();
	});

module.exports = homeRouter;