const Router = require('koa-router');
const router = new Router();
const operationRouter = require('./operation');

router
  .get('/:uid', async (ctx, next) => {
    const {data, params, db, query, settings, generateMatchBase, nkcModules} = ctx;
    const {paging} = nkcModules.apiFunction;
    const perpage = settings.paging.perpage;
    const {uid} = params;
    const {user} = data;
    const {
      PersonalForumModel,
      UserModel,
      UsersSubscribeModel,
      SettingModel,
      UsersBehaviorModel,
      ThreadModel,
      PostModel
    } = db;
    const personalForum = await PersonalForumModel.findOnly({uid});
    await personalForum.extendModerator();
    data.forum = personalForum;
    const setting = await SettingModel.findOnly({type: 'system'});
    data.popPersonalForums = setting.popPersonalForums;
    let {
      sortby = 'tlm',
      tab = 'own',
      page = 0
    } = query;
    const digest = (query.digest === 'true');
    const matchBase = generateMatchBase();
    const $sort = {};
    if(sortby === 'toc') {
      $sort.toc = -1;
      sortby = 'toc'
    }
    else {
      $sort.tlm = -1;
    }
    data.targetUser = await UserModel.findOnly({uid});
    const userSubscribe = await UsersSubscribeModel.findOnly({uid});
    data.userSubscribe = {
      subscribeUsers: userSubscribe.subscribeUsers,
      subscribers: userSubscribe.subscribers
    };
    const accessibleFid = await ctx.getThreadListFid();
    if(tab === 'reply') {
      let $matchPost = matchBase
        .set('uid', uid)
        .set('fid', {$in: accessibleFid});
      let $matchThread = matchBase;
      if(digest){
        $matchThread = $matchThread.set('$or', [{digest: true}, {digestInMid: true}]);
      }
      const posts = await PostModel.find($matchPost.toJS()).sort($sort).skip(page * perpage).limit(perpage);
      await Promise.all(posts.map(async post => {
      	const thread = await post.extendThread();
        await thread.extendFirstPost();
        await thread.extendLastPost();
        await thread.lastPost.extendUser();
	      await thread.firstPost.extendUser();
	      await thread.firstPost.extendResources();
      }));
      data.posts = posts;
      const length = await PostModel.count($matchPost.toJS());
      data.paging = paging(page, length)
    }
    else if(tab === 'own') {
      let $matchThread = matchBase.set('fid', {$in: accessibleFid});
      const $or = [
        {uid},
        {toMid: uid}
      ];
      const $and = [{$or: $or}];
      if(digest) {
        $and.push({
          $or: [{digest: true}, {digestInMid: true}]
        });
      }
      $matchThread = $matchThread.set('$and', $and);
      if(
        !user || personalForum.moderators.indexOf(user.uid) === -1
        || !ctx.data.userLevel > 4
      ) {
        //if u r not the forum-moderator/moderator, u can't access hide threads
        $matchThread = $matchThread.set('hideInMid', false);
      }
      const threads = await ThreadModel.find($matchThread.toJS()).sort($sort).skip(page*perpage).limit(perpage);
      data.threads = await Promise.all(threads.map(async thread => {
        await thread.extendFirstPost().then(async p => {
          await p.extendUser();
          await p.extendResources();
        });
        await thread.extendLastPost().then(p => p.extendUser());
        return thread;
      }));
      const length = await ThreadModel.count($matchThread.toJS());
      data.paging = paging(page, length)
    }
    else if(tab === 'recommend') {
      let $postMatch = matchBase.set('pid', {$in: personalForum.recPosts}).toJS();
      let $matchThread = matchBase.set('fid', {$in: accessibleFid}).toJS();
      if(digest){
        $matchThread = $matchThread.set('$or', [{digest: true}, {digestInMid: true}]);
      }
      let t = Date.now();
      const posts = await PostModel.find($postMatch, {_id: 0, tid: 1});
      const tidArr = posts.map(post => post.tid);
      const threads = await ThreadModel.find({$and: [$matchThread, {tid: {$in: tidArr}}]}).sort($sort).skip(page*perpage).limit(perpage);
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
    else if(tab === 'all') {
      let $sort = {};
      if(sortby === 'tlm')
        $sort = {'tlm': -1};
      else
        $sort = {'toc': -1};
      let t2 = Date.now();
      const userBehaviors = await UsersBehaviorModel.find({
        uid,
        operation: {$in: ['postToForum', 'postToThread', 'recommendPost']},
        fid: {$in: accessibleFid}
      }, {_id: 0, tid: 1}).sort({timeStamp: 1});
      const tidArr = [];
      for (let userBehavior of userBehaviors) {
        if(!tidArr.includes(userBehavior.tid)) tidArr.push(userBehavior.tid);
      }
      let $matchThread = matchBase.set('tid', {$in: tidArr});
      if(digest) {
        $matchThread = $matchThread.set('$or', [{digest: true}, {digestInMid: true}]);
      }
      const threads = await ThreadModel.find($matchThread.toJS()).sort($sort).skip(page*perpage).limit(perpage);
      data.threads = await Promise.all(threads.map(async thread => {
        await thread.extendFirstPost().then(async p => {
          await p.extendUser();
          await p.extendResources();
        });
        await thread.extendLastPost().then(p => p.extendUser());
        return thread;
      }));
      const length = await ThreadModel.count($matchThread.toJS());
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
      data.paging = paging(page, length)
    }
    if(tab === 'all' || tab === 'own' || tab === 'discuss') {
    	data.toppedThreads = [];
    	for(let tid of personalForum.toppedThreads) {
    		const thread = await ThreadModel.findOnly({tid});
    		if(thread.fid === 'recycle') continue;
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
    ctx.data.forumList = await ctx.nkcModules.dbFunction.getAvailableForums(ctx);
    ctx.data.digest = digest;
    ctx.data.tab = tab;
    ctx.data.sortby = sortby;
    await next()
  })
  .use('/:uid', operationRouter.routes(), operationRouter.allowedMethods());

module.exports = router;