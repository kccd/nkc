const Router = require('koa-router');
const router = new Router();
const operationRouter = require('./operation');

router
  .get('/:uid', async (ctx, next) => {
    const {data, params, db, query, settings, nkcModules} = ctx;
    const {paging} = nkcModules.apiFunction;
    const perpage = settings.paging.perpage;
    const {uid} = params;
    const {user} = data;
    if(user) {
      data.subscribed = await db.SubscribeModel.findOne({
        type: "user",
        uid: user.uid,
        tUid: uid
      });
    }
    const {
      PersonalForumModel,
      UserModel,
      UsersSubscribeModel,
      SettingModel,
      UsersBehaviorModel,
      ThreadModel,
      PostModel,
	    ForumModel
    } = db;
    const personalForum = await PersonalForumModel.findOnly({uid});
    await personalForum.extendModerator();
    if(user) {
    	if(personalForum.moderators.includes(user.uid)) {
    		data.isModerator = true;
	    }
    }
    data.personalForum = personalForum;

    let {
      sortby = 'tlm',
      tab = 'own',
      page = 0
    } = query;
    const digest = (query.digest === 'true');
    const $sort = {};
    if(sortby === 'toc') {
      $sort.toc = -1;
      sortby = 'toc'
    }
    else {
      $sort.tlm = -1;
    }
    data.targetUser = await UserModel.findOnly({uid});
    await db.UserModel.extendUsersInfo([data.targetUser]);
    await data.targetUser.extendGrade();
    const userSubscribe = await UsersSubscribeModel.findOnly({uid});
    data.userSubscribe = {
      subscribeUsers: userSubscribe.subscribeUsers,
      subscribers: userSubscribe.subscribers
    };
    const fidOfCanGetThread = await ForumModel.getThreadForumsId(data.userRoles, data.userGrade, data.user);
    if(tab === 'reply') {
			const q = {
				uid,
        reviewed: true,
				mainForumsId: {$in: fidOfCanGetThread}
			};
			if(digest) {
				q.$or = [{digest: true}, {digestInMid: true}];
			}
			if(!data.userOperationsId.includes('displayDisabledPosts')) {
				q.disabled = false;
			}
      // 过滤退回标记的帖子
      let posts1 = await PostModel.find(q).sort($sort).skip(page * perpage).limit(perpage);
      let posts = [];
      for(var i in posts1){
        var b = await ThreadModel.find({tid: posts1[i].tid,recycleMark: true})
        if(b.length === 0){
          posts.push(posts1[i])
        }
      }
      await Promise.all(posts.map(async post => {
        const thread = await post.extendThread();
        await thread.extendFirstPost();
        await thread.extendLastPost();
        const lastPostUser = await thread.lastPost.extendUser();
        const firstPostUser = await thread.firstPost.extendUser();
        await db.UserModel.extendUsersInfo([lastPostUser, firstPostUser]);
	      await thread.firstPost.extendResources();
        await thread.extendForums(['mainForums']);
      }));
      data.posts = posts;
      const length = await PostModel.count(q);
      data.paging = paging(page, length)
    }
    else if(tab === 'own') {
    	const q = {
        reviewed: true,
    		mainForumsId: {
		      $in: fidOfCanGetThread
			  },
		    $and: [
			    {
			    	$or: [
					    {uid}, {toMid: uid}
				    ]
			    }
		    ]
    	};
    	if(digest) {
    		q.$and.push({
			    $or: [
				    {
				    	digest: true
				    },
				    {
							digestInMid: true
				    }
			    ]
		    })
	    }
	    if(!data.userOperationsId.includes('displayDisabledPosts')) {
    		if(!data.user) {
    			q.hideInMid = false;
		    } else {
    			if(data.user.uid !== uid) {
    				q.hideInMid = false;
			    }
		    }
	    }
      // 过滤掉退回标记的帖子
			q.recycleMark = {$ne: true};
      // $matchThread = $matchThread.set('recycleMark', {"$nin":[true]});
      const threads = await ThreadModel.find(q).sort($sort).skip(page*perpage).limit(perpage);
      data.threads = await ThreadModel.extendThreads(threads, {
        forum: true
      });
      /*data.threads = await Promise.all(threads.map(async thread => {
        await thread.extendFirstPost().then(async p => {
          await p.extendUser();
          await p.extendResources();
        });
        await thread.extendLastPost().then(p => p.extendUser());
        return thread;
      }));*/
      const length = await ThreadModel.count(q);
      data.paging = paging(page, length)
    }
    else if(tab === 'recommend') {
      let $postMatch = matchBase.set('pid', {$in: personalForum.recPosts}).toJS();
      let $matchThread = matchBase.set('fid', {$in: fidOfCanGetThread}).toJS();
      if(digest){
        $matchThread = $matchThread.set('$or', [{digest: true}, {digestInMid: true}]);
      }
      let t = Date.now();
      const posts = await PostModel.find($postMatch, {_id: 0, tid: 1});
      const tidArr = posts.map(post => post.tid);
      const threads = await ThreadModel.find({$and: [$matchThread, {reviewed: true},{tid: {$in: tidArr}}]}).sort($sort).skip(page*perpage).limit(perpage);
      data.threads = await Promise.all(threads.map(async thread => {
        await thread.extendFirstPost().then(async p => {
          await p.extendUser();
          await p.extendResources();
        });
        await thread.extendLastPost().then(p => p.extendUser());
        return thread;
      }));
      /*data.threads = await PostModel.aggregate([
        {$match: $postMatch},
        {$lookup: {
          from: 'threads',
          localField: 'tid',
          foreignField: 'tid',
          as: 'thread'
        }},
        {$unwind: '$thread'},
        {$match: $matchThread},
        {$skip: page * perpage},
        {$limit: perpage},
        {$sort},
        {$lookup: {
          from: 'posts',
          localField: 'thread.oc',
          foreignField: 'pid',
          as: 'thread.firstPost'
        }},
        {$unwind: '$thread.firstPost'}
      ]);


      const length = await PostModel.aggregate([
        {$match: $postMatch},
        {$lookup: {
          from: 'threads',
          localField: 'tid',
          foreignField: 'tid',
          as: 'thread'
        }},
        {$match: $matchThread},
        {$count: 'length'}
      ]);*/
      const length = await ThreadModel.count({$and: [$matchThread, {tid: {$in: tidArr}}]});
      data.paging = paging(page, length)
    }
    else if(tab === 'subscribe') {
      const {subscribeUsers, subscribeForums} = await UsersSubscribeModel.findOnly({uid});
      const $and = [
        {$or: [
          {
            uid: {$in: subscribeUsers},
          },
          {
            fid: {$in: subscribeForums}
          }
        ]},
        {fid: {$in: accessibleFid}}
      ];
      if(digest) {
        $and.splice(0, 0, {$or: [{digest: true}, {digestInMid: true}]});
      }
      const $USM = matchBase.set('$and', $and).toJS();
      $USM.reviewed = true;
      const threads = await ThreadModel.find($USM).sort($sort).skip(page*perpage).limit(perpage);
      data.threads = await Promise.all(threads.map(async thread => {
        await thread.extendFirstPost().then(async p => {
          await p.extendUser();
          await p.extendResources();
        });
        await thread.extendLastPost().then(p => p.extendUser());
        return thread;
      }));
      /*data.threads = await ThreadModel.aggregate([
        {$sort},
        {$match: $USM},
        {$skip: page * perpage},
        {$limit: perpage},
        {$lookup: {
          from: 'posts',
          localField: 'oc',
          foreignField: 'pid',
          as: 'oc'
        }},
        {$unwind: 'oc'},
        {$lookup: {
          from: 'users',
          localField: 'oc.uid',
          foreignField: 'uid',
          as: 'oc.user'
        }},
        {$unwind: 'oc.user'},
        {$lookup: {
          from: 'posts',
          localField: 'lm',
          foreignField: 'pid',
          as: 'lm'
        }},
        {$unwind: 'lm'},
        {$lookup: {
          from: 'users',
          localField: 'lm.uid',
          foreignField: 'uid',
          as: 'lm.user'
        }},
        {$unwind: 'lm.user'}
      ]);*/
      const length = await ThreadModel.count($USM);
      data.paging = paging(page, length)
    }
    // 专栏下的全部
    else if(tab === 'all') {
    	const q = {uid, mainForumsId: {$in: fidOfCanGetThread}};
    	const displayRecycleMarkThreads = data.userOperationsId.includes('displayRecycleMarkThreads');
    	let $sort = {};
    	if(sortby === 'tlm') {
				$sort = {tlm: -1};
	    } else {
    		$sort = {toc: -1};
	    }
	    q.operationId = {$in: ['postToForum', 'postToThread']};
	    const count = await db.InfoBehaviorModel.count(q);
      const paging = ctx.nkcModules.apiFunction.paging(page, count);
    	const infoLogs = await db.InfoBehaviorModel.find(q).sort($sort).skip(paging.start).limit(paging.perpage);
    	const threads = [];
    	for(const log of infoLogs) {
    		const thread  = await db.ThreadModel.findOne({tid: log.tid});
    		if(thread && thread.reviewed === true) {
    			if(thread.recycleMark && !displayRecycleMarkThreads) continue;
					await thread.extendFirstPost().then(async p => {
            const u = await p.extendUser();
            await db.UserModel.extendUsersInfo([u]);
          });
					if(thread.lm) {
						await thread.extendLastPost().then(async p => {
              const u = await p.extendUser();
              await db.UserModel.extendUsersInfo([u]);
            });
					} else {
						thread.lastPost = thread.firstPost;
					}
					await thread.extendForums(['mainForums']);
					await thread.extendCategory();
		    }
		    threads.push(thread);
	    }
	    data.threads = threads;
    	data.paging = paging;
     /* let $sort = {};
      if(sortby === 'tlm')
        $sort = {'tlm': -1};
      else
        $sort = {'toc': -1};
      const userBehaviors = await db.InfoBehaviorModel.find({
        uid,
        operation: {$in: ['postToForum', 'postToThread', 'recommendPost']},
        fid: {$in: fidOfCanGetThread}
      }, {_id: 0, tid: 1}).sort({timeStamp: 1});
      const tidArr = [];
      for (let userBehavior of userBehaviors) {
        if(!tidArr.includes(userBehavior.tid)) tidArr.push(userBehavior.tid);
      }
      let $matchThread = matchBase.set('tid', {$in: tidArr});
      if(digest) {
        $matchThread = $matchThread.set('$or', [{digest: true}, {digestInMid: true}]);
      }
      // 过滤掉有退回标记的帖子
      $matchThread = $matchThread.set("recycleMark",{"$nin":[true]})
      $matchThread = $matchThread.set("fid",{"$nin":["recycle"]})
      const threads = await ThreadModel.find($matchThread.toJS()).sort($sort).skip(page*perpage).limit(perpage);
      data.threads = await Promise.all(threads.map(async thread => {
        await thread.extendFirstPost().then(async p => {
          await p.extendUser();
          await p.extendResources();
        });
        await thread.extendLastPost().then(p => p.extendUser());
        return thread;
      }));
      const length = await ThreadModel.count($matchThread.toJS());*/
      /*data.threads = await UsersBehaviorModel.aggregate([
        {$sort: {
          timeStamp: 1
        }},
        {$match: {
          uid,
          operation: {$in: ['postToForum', 'postToThread', 'recommendPost']},
          fid: {$in: accessibleFid},
        }},
        {$group: {
          _id: '$tid',
          lastPost: {$first: '$$ROOT'}
        }},
        {$replaceRoot: {newRoot: '$lastPost'}},
        {$lookup: {
          from: 'threads',
          localField: 'tid',
          foreignField: 'tid',
          as: 'thread'
        }},
        {$match: $digest},
        {$sort},
        {$skip: page * perpage},
        {$limit: perpage},
        {$unwind: '$thread'},
        {$lookup: {
          from: 'posts',
          localField: 'thread.oc',
          foreignField: 'pid',
          as: 'thread.firstPost'
        }},
        {$unwind: '$thread.firstPost'},
        {$lookup: {
          from: 'posts',
          localField: 'pid',
          foreignField: 'pid',
          as: 'thread.lastPost'
        }},
        {$unwind: '$thread.lastPost'},
        {$lookup: {
          from: 'users',
          localField: 'thread.firstPost.uid',
          foreignField: 'uid',
          as: 'thread.firstPost.user'
        }},
        {$unwind: '$thread.firstPost.user'},
        {$lookup: {
          from: 'users',
          localField: 'thread.lastPost.uid',
          foreignField: 'uid',
          as: 'thread.lastPost.user'
        }},
        {$unwind: '$thread.lastPost.user'},
        {$replaceRoot: {
          newRoot: '$thread'
        }}
      ]);
      const {length} = await UsersBehaviorModel.aggregate([
        {$sort: {
          timeStamp: 1
        }},
        {$match: {
          uid,
          operation: {$in: ['postToForum', 'postToThread', 'recommendPost']},
          fid: {$in: accessibleFid},
        }},
        {$group: {
          _id: '$tid',
          lastPost: {$first: '$$ROOT'}
        }},
        {$count: 'length'}
        ]);*/
    }
    // 专栏下的置顶
    if(tab === 'all' || tab === 'own' || tab === 'discuss') {
    	data.toppedThreads = [];
    	for(let tid of personalForum.toppedThreads) {
    		const thread = await ThreadModel.findOnly({tid});
    		if(!fidOfCanGetThread.includes(thread.fid) ||!thread.reviewed) continue;
        if(thread.fid === 'recycle') continue;
        // 过滤掉有退回标记的帖子
        if(thread.recycleMark && thread.recycleMark === true) continue;
		    await thread.extendFirstPost().then(async p => {
			    await p.extendUser();
			    await p.extendResources();
		    });
		    await thread.extendLastPost().then(p => p.extendUser());
				data.toppedThreads.push(thread);
	    }
    }
    ctx.template = 'interface_personal_forum.pug';
    if(ctx.data.user)
      ctx.data.userThreads = await ctx.data.user.getUsersThreads();
    ctx.data.forumList = await ForumModel.getAccessibleForums(data.userRoles, data.userGrade, data.user);
    ctx.data.digest = digest;
    ctx.data.tab = tab;
    ctx.data.sortby = sortby;
    if(data.threads) {
	    await Promise.all(data.threads.map(async thread => {
	      const forum = await ForumModel.findOne({fid: thread.fid});
	      thread.forum = forum;
	      if(forum && forum.parentId) {
          await forum.extendParentForum();
        }
	    }));
    }
    await next()
  })
  .use('/:uid', operationRouter.routes(), operationRouter.allowedMethods());

module.exports = router;