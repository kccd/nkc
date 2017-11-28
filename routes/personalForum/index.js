const Router = require('koa-router');
const router = new Router();

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
      PostModel,
    } = db;
    const personalForum = await PersonalForumModel.findOnly({uid});
    await personalForum.extendModerator();
    data.forum = personalForum;
    const setting = await SettingModel.findOnly({uid: 'system'});
    data.popPersonalForums = setting.popPersonalForums;
    let {
      sortby = 'tlm',
      digest = false,
      tab = 'all',
      page = 0
    } = query;
    const matchBase = generateMatchBase();
    const $sort = {};
    if(sortby === 'toc') {
      $sort.toc = 1;
      sortby = 'toc'
    }
    else {
      $sort.tlm = 1;
    }
    data.targetUser = await UserModel.findOnly({uid});
    const visibleFid = await ctx.getVisibleFid();
    if(tab === 'reply') {
      let $matchPost = matchBase
        .set('uid', uid)
        .set('fid', {$in: visibleFid});
      if(digest)
        $matchPost = $matchPost.set('digest', true);
      const posts = await PostModel.find($matchPost.toJS(), {_id: 0, tid: 1}).sort($sort).skip(page*perpage).limit(perpage);
      data.threads = await Promise.all(posts.map(async post => {
        const thread = await ThreadModel.findOnly({tid: post.tid});
        await thread.extendFirstPost().then(p => p.extendUser());
        await thread.extendLastPost().then(p => p.extendUser());
        return thread;
      }));
      /*data.threads = await PostModel.aggregate([
        {$sort: $sort},
        {$match: $matchPost.toJS()},
        {$skip: page * perpage},
        {$limit: perpage},
        {$lookup: {
          from: 'threads',
          localField: 'tid',
          foreignField: 'tid',
          as: 'thread'
        }},
        {$unwind: '$thread'},
        {$lookup: {
          from: 'posts',
          localField: 'thread.oc',
          foreignField: 'pid',
          as: 'thread.oc'
        }},
        {$unwind: '$thread.oc'}
      ]);*/
      const length = await PostModel.count($matchPost.toJS());
      /*const {length} = await PostModel.aggregate([
        {$sort: $sort},
        {$match: $matchPost.toJS()},
        {$count: 'length'}
      ]);*/
      data.paging = paging(page, length)
    }
    else if(tab === 'own') {
      let $matchThread = matchBase.set('fid', {$in: visibleFid});
      $matchThread = $matchThread.set('$or', [
        {uid},
        {mid: uid}
      ]);
      if(
        !user || personalForum.moderators.indexOf(user.uid) === -1
        || !ctx.data.userLevel > 4
      ) {
        //if u r not the forum-moderator/moderator, u can't access hide threads
        $matchThread = $matchThread.set('hideInMid', false);
      }
      if(digest)
        $matchThread = $matchThread.set('digest', true);
      const threads = await ThreadModel.find($matchThread.toJS()).sort($sort).skip(page*perpage).limit(perpage);
      data.threads = await Promise.all(threads.map(async thread => {
        await thread.extendFirstPost().then(p => p.extendUser());
        await thread.extendLastPost().then(p => p.extendUser());
        return thread;
      }));
      /*data.threads = await ThreadModel.aggregate([
        {$sort},
        {$match: $matchThread.toJS()},
        {$skip: page * perpage},
        {$limit: perpage},
        {$lookup: {
          from: 'posts',
          localField: 'oc',
          foreignField: 'pid',
          as: 'oc'
        }},
        {$unwind: '$oc'},
        {$lookup: {
          from: 'users',
          localField: 'oc.uid',
          foreignField: 'uid',
          as: 'oc.user'
        }},
        {$unwind: '$oc.user'}
      ]);*/
      const length = await ThreadModel.count($matchThread.toJS());
      /*const {length} = await await ThreadModel.aggregate([
        {$sort},
        {$match: $matchThread.toJS()},
        {$count: 'length'}
      ]);*/
      data.paging = paging(page, length)
    }
    else if(tab === 'recommend') {
      let $postMatch = matchBase.set('pid', {$in: personalForum.recPosts}).toJS();
      let $matchThread = matchBase.set('fid', {$in: visibleFid}).toJS();
      if(digest)
        $matchThread = $matchThread.set('digest', true);
      let t = Date.now();
      const posts = await PostModel.find($postMatch, {_id: 0, tid: 1});
      const tidArr = posts.map(post => post.tid);
      const threads = await ThreadModel.find({$and: [$matchThread, {tid: {$in: tidArr}}]}).sort($sort).skip(page*perpage).limit(perpage);
      data.threads = await Promise.all(threads.map(async thread => {
        await thread.extendFirstPost().then(p => p.extendUser());
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
      console.log(`耗时： ${Date.now() - t}`)

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
        {fid: {$in: visibleFid}}
      ];
      if(digest)
        $and.splice(0, 0, {digest});
      const $USM = matchBase.set('$and', $and).toJS();
      const threads = await ThreadModel.find($USM).sort($sort).skip(page*perpage).limit(perpage);
      data.threads = await Promise.all(threads.map(async thread => {
        await thread.extendFirstPost().then(p => p.extendUser());
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
      const $digest = digest? {'thread.digest': true}: {};
      let $sort = {};
      if(sortby === 'tlm')
        $sort = {'thread.tlm': -1};
      else
        $sort = {'thread.toc': -1};
      /*const userBehavaior = await UsersBehaviorModel.find({
        uid,
        operation: {$in: ['postToForum', 'postToThread', 'recommendPost']},
        fid: {$in: visibleFid},
      }).sort({timeStamp: 1});
      const tidArr = [];*/

      data.threads = await UsersBehaviorModel.aggregate([
        {$sort: {
          timeStamp: 1
        }},
        {$match: {
          uid,
          operation: {$in: ['postToForum', 'postToThread', 'recommendPost']},
          fid: {$in: visibleFid},
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
      if(tab === ('all' || 'own' || 'discuss')) {
        data.toppedThreads = await Promise.all(personalForum.toppedThreads.map(async tid => {
          const thread = await ThreadModel.findOnly({tid});
          await thread.extendFirstPost().then(p => p.extendUser());
          await thread.extendLastPost().then(p => p.extendUser());
          return thread;
        }));
      }
      const length = await UsersBehaviorModel.count({
          uid,
          operation: {$in: ['postToForum', 'postToThread', 'recommendPost']},
          fid: {$in: visibleFid},
        });
      data.paging = paging(page, length)
    }
    ctx.template = 'interface_personal_forum.pug';
    if(ctx.data.user)
      ctx.data.userThreads = await ctx.data.user.getUsersThreads();
    ctx.data.forumList = await ctx.nkcModules.dbFunction.getAvailableForums(ctx);
    ctx.data.digest = digest;
    ctx.data.tab = tab;
    ctx.data.sortby = sortby;
    await next()
  });

module.exports = router;