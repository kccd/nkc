const Router = require('koa-router');
const router = new Router();

router
  .get('/:uid', async (ctx, next) => {
    const {data, params, db, query, settings, generateMatchBase} = ctx;
    const mongoose = settings.database;
    const perpage = settings.paging.perpage;
    const {uid} = params;
    const {PersonalForumModel, UserModel, UsersSubscribeModel, SettingModel} = db;
    const personalForum = await PersonalForumModel.findOnly({uid});
    await personalForum.extendModerator();
    data.forum = personalForum;
    const setting = await SettingModel.findOnly({uid: 'system'});
    data.popPersonalForums = setting.popPersonalForums;
    const {sortby, digest, tab = 'all', page = 0} = query;
    const matchBase = generateMatchBase();
    const $sort = {};
    if(sortby)
      $sort.toc = 1;
    else
      $sort.tlm = 1;
    data.targetUser = await UserModel.findOnly({uid});
    const visibleFid = await ctx.getVisibleFid();
    const $groupWithCount = {
      _id: null,
      threads: {$push: '$$root'},
      count: {$sum: 1}
    };
    const $returnCount = {
      _id: 0,
      count: 1,
      threads: {
        $slice: [
          '$threads',
          page ? (page - 1) * perpage : 0,
          perpage
        ]
      }
    };
    if(tab === 'reply') {
      const $matchPost = matchBase.set('uid', uid);
      let $matchThread = matchBase;
      $matchThread = $matchThread.set('fid', {$in: visibleFid});
      if(digest)
        $matchThread = $matchThread.set('digest', true);
      data.threads = await mongoose.connection.db.collection('posts').aggregate([
        {$match: $matchPost.toJS()},
        {$group: {
          _id: '$tid',
          posts: {$push: '$$root'}
        }},
        {$lookup: {
          from: 'threads',
          localField: 'tid',
          foreignField: 'tid',
          as: 't'
        }},
        {$project: {t: {lastPost: '$posts[0]'}}},
        {$replaceRoot: {newRoot: '$t'}},
        {$match: $matchThread.toJS()},
        {$sort},
        {$lookup: {
          from: 'posts',
          localField: 'oc',
          foreignField: 'pid',
          as: 'oc'
        }},
        {$lookup: {
          from: 'users',
          localField: 'oc.uid',
          foreignField: 'uid',
          as: 'oc.user'
        }},
        {$lookup: {
          from: 'users',
          localField: 'oc',
          foreignField: 'pid',
          as: 'oc'
        }},
        {$group: $groupWithCount},
        {$project: $returnCount}
      ]);
    }
    else if(tab === 'own') {
      let $matchThread = matchBase.set('fid', {$in: visibleFid});
      $matchThread = $matchThread.set('uid', uid);
      if(
        !user || personalForum.moderators.indexOf(user._key) === -1
        || !ctx.ensurePermission('POST', '/t/x/digest')
      ) {
        //if u r not the forum-moderator/moderator, u can't access hide threads
        $matchThread = $matchThread.set('hideInMid', false);
      }
      if(digest)
        $matchThread = $matchThread.set('digest', true);
      data.threads = await mongoose.connection.db.collection('threads').aggregate([
        {$match: $matchThread.toJS()},
        {$sort},
        {$group: {
          _id: '$tid',
          threads: {$push: '$$root'}
        }},
        {$lookup: {
          from: 'posts',
          localField: 'oc',
          foreignField: 'pid',
          as: 'oc'
        }},
        {$group: $groupWithCount},
        {$project: $returnCount}
      ])
    }
    else if(tab === 'recommend') {
      let $postMatch = matchBase.set('pid', {$in: personalForum.recPosts});
      let $matchThread = matchBase.set('fid', {$in: visibleFid});
      if(digest)
        $matchThread = $matchThread.set('digest', true);
      data.threads = await mongoose.connection.db.collection('posts').aggregate([
        {$match: $postMatch},
        {$lookup: {
          from: 'threads',
          localField: 'tid',
          foreignField: 'tid',
          as: 'thread'
        }},
        {$match: $matchThread},
        {$sort},
        {$lookup: {
          from: 'posts',
          localField: 'thread.oc',
          foreignField: 'pid',
          as: 'thread.oc'
        }},
        {$group: $groupWithCount},
        {$project: $returnCount}
      ])
    }
    else if(tab === 'discuss') {
      $matchThread = $matchThread.set('toMid', uid);
      $matchThread = $matchThread.set('fid', {$in: visibleFid});
      if(
        !user || personalForum.moderators.indexOf(user._key) === -1
        || !ctx.ensurePermission('POST', '/t/x/digest')
      ) {
        $matchThread = $matchThread.set('hideInToMid', false);
      }
      if(digest)
        $matchThread = $matchThread.set('digest', true);
      data.threads = await mongoose.connection.db.collection('threads').aggregate([
        {$match: $matchThread},
        {$sort},
        {$group: $groupWithCount},
        {$project: $returnCount},
        {$unwind: '$threads'},
        {$lookup: {
          from: 'posts',
          localField: 'threads.oc',
          foreignField: 'pid',
          as: 'threads.oc'
        }},
        {$lookup: {
          from: 'users',
          localField: 'threads.oc.uid',
          foreignField: 'uid',
          as: 'threads.oc.user'
        }},
        {$lookup: {
          from: 'posts',
          localField: 'threads.lm',
          foreignField: 'pid',
          as: 'threads.lm'
        }},
        {$lookup: {
          from: 'users',
          localField: 'threads.lm.uid',
          foreignField: 'uid',
          as: 'threads.lm.user'
        }},
      ])
    }
    else if(tab === 'subscribe') {
      const {subscribeUsers} = await UsersSubscribeModel.findOnly(uid);
      let $matchThread = matchBase.set('uid', {$in: subscribeUsers});
      $matchThread = $matchThread.set('fid', {$in: visibleFid});
      data.threads = await mongoose.connection.db.collection('threads').aggregate([
        {$match: $matchThread},
        {$sort},
        {$group: $groupWithCount},
        {$project: $returnCount},
        {$unwind: '$threads'},
        {$lookup: {
          from: 'posts',
          localField: 'threads.oc',
          foreignField: 'pid',
          as: 'threads.oc'
        }},
        {$lookup: {
          from: 'users',
          localField: 'threads.oc.uid',
          foreignField: 'uid',
          as: 'threads.oc.user'
        }},
        {$lookup: {
          from: 'posts',
          localField: 'threads.lm',
          foreignField: 'pid',
          as: 'threads.lm'
        }},
        {$lookup: {
          from: 'users',
          localField: 'threads.lm.uid',
          foreignField: 'uid',
          as: 'threads.lm.user'
        }},
      ])
    }
    else if(tab === 'all') {
      const base = matchBase.toJS();
      data.threads = await mongoose.connection.db.collection('usersBehavior').aggregate([
        {$match: {
          uid,
          operation: {$in: ['postToForum', 'postToThread', 'recommendPost']},
          fid: {$in: visibleFid}
        }},
        {$group: {_id: '$tid'}},
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
        {$unwind: '$thread.oc'},
        {$lookup: {
          from: 'posts',
          localField: 'pid',
          foreignField: 'pid',
          as: 'thread.lm'
        }},
        {$unwind: '$thread.lm'},
        // {$match: {
        //   'thread.lm.disabled': base.disabled
        // }},
        {$sort: {
          timeStamp: -1
        }},
        {$skip: page * perpage},
        {$limit: perpage},
        {$lookup: {
          from: 'users',
          localField: 'thread.oc.uid',
          foreignField: 'uid',
          as: 'thread.oc.user'
        }},
        {$unwind: '$thread.oc.user'},
        {$lookup: {
          from: 'users',
          localField: 'thread.lm.uid',
          foreignField: 'uid',
          as: 'thread.lm.user'
        }},
        {$unwind: '$thread.lm.user'},
        {$replaceRoot: {
          newRoot: '$thread'
        }}
      ]).toArray()
    }
    ctx.template = 'interface_personal_forum.pug';
    ctx.data.userThreads = await ctx.data.user.getUsersThreads();
    ctx.data.forumlist = await ctx.nkcModules.dbFunction.getAvailableForums(ctx);
    console.log(ctx.data.forumlist)
    await next()
  });

module.exports = router;