const Router = require('koa-router');
const router = new Router();

router
  .get('/:uid', async (ctx, next) => {
    const {data, params, db, query, settings, generateMatchBase} = ctx;
    const mongoose = settings.database;
    const perpage = settings.paging.perpage;
    const {uid} = params;
    const {
      PersonalForumModel,
      UserModel,
      UsersSubscribeModel,
      SettingModel,
      UsersBehavior,
      ThreadModel,
      PostModel,
    } = db;
    const personalForum = await PersonalForumModel.findOnly({uid});
    data.forum = await personalForum.extendModerator();
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
      let $matchPost = matchBase
        .set('uid', uid)
        .set('fid', {$in: visibleFid});
      if(digest)
        $matchPost = $matchPost.set('digest', true);
      data.threads = await PostModel.aggregate([
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
      ]);
      const {length} = await PostModel.aggregate([
        {$sort: $sort},
        {$match: $matchPost.toJS()},
        {$count: 'length'}
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
    else if(tab === 'subscribe') {
      const {subscribeUsers, subscribeForums} = await UsersSubscribeModel.findOnly({uid});
      data.threads = await ThreadModel.aggregate([
        {$sort},
        {$match: {
          $and: [
            {$or: [
              {
                uid: {$in: subscribeUsers},
              },
              {
                fid: {$in: subscribeForums}
              }
            ]},
            {$in: visibleFid}
          ]
        }},
        {$skip: page * perpage},
        {$limit: perpage},
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
      data.threads = await mongoose.connection.db.collection('usersBehavior').aggregate([
        {$sort: {
          timeStamp: -1
        }},
        {$match: {
          uid,
          operation: {$in: ['postToForum', 'postToThread', 'recommendPost']},
          fid: {$in: visibleFid},
        }},
        {$skip: page * perpage},
        {$limit: perpage},
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
    await next()
  });

module.exports = router;