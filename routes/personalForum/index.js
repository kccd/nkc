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
    data.forum = await personalForum.extendModerator();
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
    data.targetUser.navbarDesc = ctx.getUserDescription(data.targetUser);
    const visibleFid = await ctx.getVisibleFid();
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
      data.threads = await ThreadModel.aggregate([
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
      ]);
      const {length} = await await ThreadModel.aggregate([
        {$sort},
        {$match: $matchThread.toJS()},
        {$count: 'length'}
      ]);
      data.paging = paging(page, length)
    }
    else if(tab === 'recommend') {
      let $postMatch = matchBase.set('pid', {$in: personalForum.recPosts});
      let $matchThread = matchBase.set('fid', {$in: visibleFid});
      if(digest)
        $matchThread = $matchThread.set('digest', true);
      data.threads = await PostModel.aggregate([
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
          as: 'thread.oc'
        }},
        {$unwind: 'thread.oc'}
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
      ]);
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
        {$in: visibleFid}
      ];
      if(digest)
        $and.splice(0, 0, {digest});
      const $USM = matchBase.set('$and', $and);
      data.threads = await ThreadModel.aggregate([
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
      ]);
      const length = await ThreadModel.count({$USM});
      data.paging = paging(page, length)
    }
    else if(tab === 'all') {
      const $digest = digest? {'thread.digest': true}: {};
      let $sort = {};
      if(sortby === 'tlm')
        $sort = {'thread.tlm': -1};
      else
        $sort = {'thread.toc': -1};
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
      ]);
      const length = await UsersBehaviorModel.count({
          uid,
          operation: {$in: ['postToForum', 'postToThread', 'recommendPost']},
          fid: {$in: visibleFid},
        });
      data.paging = paging(page, length)
    }
    ctx.template = 'interface_personal_forum.pug';
    ctx.data.userThreads = await ctx.data.user.getUsersThreads();
    ctx.data.forumList = await ctx.nkcModules.dbFunction.getAvailableForums(ctx);
    ctx.data.digest = digest;
    ctx.data.tab = tab;
    ctx.data.sortby = sortby;
    await next()
  });

module.exports = router;