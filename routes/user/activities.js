const Router = require('koa-router');
const activitiesRouter = new Router();
const apiFn = require('../../nkcModules/apiFunction');
const {contentFilter} = require('../../tools/checkString');
activitiesRouter
  .get('/', async (ctx, next) => {
    const {data, db} = ctx;
    const {user} = data;
    const {uid} = ctx.params;
    const targetUser = await db.UserModel.findOnly({uid});
    data.targetUser = targetUser;
    if(user.uid === uid) {
      ctx.template = 'self.pug';
      data.navbar = {highlight: 'activities'};
    } else {
      ctx.template = 'interface_activities_personal.pug'
    }
    const page = ctx.query.page || 0;
    const lastTime = targetUser.lastVisitSelf;
    const userSubscribe = await db.UsersSubscribeModel.findOnly({uid: targetUser.uid});
    const {subscribeUsers, subscribeForums} = userSubscribe;
    const q = {
      $or: [
        {uid: targetUser.uid},
        {mid: targetUser.uid},
        {toMid: targetUser.uid},
        {uid: {$in: subscribeUsers}}
      ],
      tid: {$ne: null}
    };
    const length = await db.UsersBehaviorModel.count(q);
    const paging = apiFn.paging(page, length);
    data.paging = paging;
    const userBehaviors = await db.UsersBehaviorModel.find(q).sort({timeStamp: -1}).skip(paging.start).limit(paging.perpage);
    let targetBH = [];
    if(page === 0 && user.uid === uid) {
      const subscribeForumBehaviors = await db.UsersBehaviorModel.aggregate([
        {
          $match: {
            timeStamp: {$gt: lastTime},
            fid: {$in: subscribeForums},
            tid: {$ne: null}
          }
        },
        {
          $group: {
            _id: '$tid',
            threadsInGroup: {$push: '$$ROOT'}
          }
        },
        {
          $project: {
            tid: '$_id',
            threadsInGroup: 1
          }
        },
        {
          $match: {
            'threadsInGroup.5': {$exists: 1}
          }
        }
      ]);
      targetBH = await Promise.all(subscribeForumBehaviors.map(b => {
        const length = b.threadsInGroup.length;
        const lastBH = b.threadsInGroup.pop();
        lastBH.actInThread = length;
        return lastBH;
      }));
      await user.update({lastVisitSelf: Date.now()});
      ctx.print('targetBH', targetBH);
    }
    const activities = userBehaviors.concat(targetBH);
    data.activities = await Promise.all(activities.map(async activity => {
      activity.thread = await db.ThreadModel.findOnly({tid: activity.tid});
      activity.oc = await db.PostModel.findOnly({pid: activity.thread.oc});
      activity.post = await db.PostModel.findOnly({pid: activity.pid});
      activity.post.c = contentFilter(activity.post.c);
      activity.forum = await db.ForumModel.findOnly({fid: activity.fid});
      activity.myForum = activity.mid ? await db.PersonalForumModel.findOnly({uid: activity.mid}): {};
      activity.toMyForum = activity.toMid ? await db.PersonalForumModel.findOnly({uid: activity.toMid}): {};
      activity.user = await db.UserModel.findOnly({uid: activity.uid});
      try{
        return activity.toObject();
      } catch(e) {
        return activity;
      }
    }));
    data.forum = await db.PersonalForumModel.findOnly({uid});
    await next();
  });
module.exports = activitiesRouter;
