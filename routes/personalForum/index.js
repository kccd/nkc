const Router = require('koa-router');
const router = new Router();

router
  .get('/:uid', async () => {
    const {data, params, db, query, getVisibleFid, settings, generateMatchBase} = ctx;
    const mongoose = settings.database;
    const {uid} = params;
    const {PersonalForumModel, UserModel} = db;
    const personalForum = PersonalForumModel.findOnly({uid});
    await personalForum.extendModerator();
    data.forum = personalForum;
    const {sortby, digest, tab} = query;
    const $match = generateMatchBase({uid});
    if(digest)
      $match.digest = true;
    const $sort = {};
    if(sortby)
      $sort.toc = 1;
    else
      $sort.tlm = 1;
    const targetUser = await UserModel.findOnly({uid});
    const visibleFid = await getVisibleFid();
    if(tab === 'reply')
      data.threads = await mongoose.connection.db.collection('posts').aggregate([
        {$match,},
        {$group: {
          tid: '$tid',
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
        }}
      ])
  })