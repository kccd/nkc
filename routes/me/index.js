const Router = require('koa-router');
const nkcModules = require('../../nkcModules');
const apiFn = nkcModules.apiFunction;
const dbFn = nkcModules.dbFunction;
const {contentFilter} = require('../../tools/checkString');
const meRouter = new Router();
meRouter
  .get('/', async (ctx, next) => {
    const {db, data} = ctx;
    const {user} = data;
    data.examinated = ctx.query.examinated;
    if(!user) {
      ctx.throw(401, '您还没有登陆，请登录后再试。');
    }
    data.replyTarget = 'me';
    data.personal = await db.UsersPersonalModel.findOnly({uid: user.uid});
    let subscribe = await db.UsersSubscribeModel.findOnly({uid: user.uid});
    let subscribeForums = '';
    if(subscribe.subscribeForums) {
      subscribeForums = subscribe.subscribeForums.join(',');
    }else {
      subscribeForums = '';
    }
    data.user.subscribeForums = subscribeForums;
    data.forumList = await dbFn.getAvailableForums(ctx);
    let userPersonal = await db.UsersPersonalModel.findOne({uid: user.uid});
    if(userPersonal.mobile) data.user.mobile = (userPersonal.mobile.slice(0,3) === '0086')? userPersonal.mobile.replace('0086', '+86'): userPersonal.mobile;
    ctx.template = 'interface_me.pug';
    await next();
  })
  .get('/activities', async (ctx, next) => {
    const {data, db} = ctx;
    const {user} = data;
    ctx.template = 'self.pug';
    data.navbar = {highlight: 'activities'};
    const page = ctx.query.page || 0;
    ctx.print('page', page);
    const lastTime = user.lastVisitSelf;
    const userSubscribe = await db.UsersSubscribeModel.findOnly({uid: user.uid});
    const {subscribeUsers, subscribeForums} = userSubscribe;
    const q = {
      $or: [
        {uid: user.uid},
        {mid: user.uid},
        {toMid: user.uid},
        {uid: {$in: subscribeUsers}}
      ],
      tid: {$ne: null}
    };
    const length = await db.UsersBehaviorModel.count(q);
    const paging = apiFn.paging(page, length);
    const userBehaviors = await db.UsersBehaviorModel.find(q).sort({timeStamp: -1}).skip(paging.start).limit(paging.perpage);
    let targetBH = [];
    if(page === 0) {
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
      return activity.toObject();
    }));
    await user.update({lastVisitSelf: Date.now()});
    await next();
  })
  .patch('/username', async (ctx, next) => {
    //data = '修改用户名';
    await next();
  })
  .patch('/password', async (ctx, next) => {
    const db = ctx.db;
    const params = ctx.body;
    const user = ctx.data.user;
    if(!params.oldPassword) ctx.throw(400, '旧密码不能为空');
    if(!params.newPassword || !params.newPassword2) ctx.throw(400, '新密码不能为空');
    if(params.newPassword !== params.newPassword2) ctx.throw(400, '两次输入的密码不一致！请重新输入');
    let userPersonal = await db.UsersPersonalModel.findOne({uid: user.uid});
    if(!apiFn.testPassword(params.oldPassword, userPersonal.hashType, userPersonal.password)){
      ctx.throw(400, '密码不正确，请重新输入');
    }
    const newPasswordObj = apiFn.newPasswordObject(params.newPassword);
    await db.UsersPersonalModel.updateOne({uid: user.uid}, {$set:newPasswordObj});
    await next();
  })
  .patch('/personalsetting', async (ctx, next) => {
    const db = ctx.db;
    const params = ctx.body;
    const user = ctx.data.user;
    const settingObj = {};
    settingObj.postSign = params.post_sign.toString().trim();
    settingObj.description = params.description.toString().trim();
    settingObj.color = params.color.toString().trim();
    let subscribeForums = params.focus_forums.toString().trim() || '';
    subscribeForums = subscribeForums.split(',');
    const relFid = [];
    for (let fid of subscribeForums) {
      const forum = await db.ForumModel.findOne({fid});
      if(forum && !relFid.includes(fid)) relFid.push(fid);
    }
    if(settingObj.postSign.length>300||settingObj.description.length>300||settingObj.color.length>10) {
      ctx.throw(400, '提交的内容字数超出限制，请检查');
    }
    await db.UserModel.update({uid: user.uid}, {$set: settingObj});
    await db.UsersSubscribeModel.replaceOne({uid: user.uid},{$set:{subscribeForums: relFid}});
    await next();
  })
  .post('/mobile', async (ctx, next) => {
    const {db} = ctx;
    const {user} = ctx.data;
    const {mobile, areaCode, code} = ctx.body;
    if(!mobile) ctx.throw(400, '电话号码不能为空！');
    if(!areaCode) ctx.throw(400, '国际区号不能为空！');
    if(!code) ctx.throw(400, '手机短信验证码不能为空！');
    const newMobile = (areaCode + mobile).replace('+', '00');
    const userPersonal = await db.UsersPersonalModel.findOne({uid: user.uid});
    if(userPersonal.mobile) ctx.throw(400, `此账号已绑定手机号码： ${userPersonal.mobile}`);
    const mobileCodesNumber = await dbFn.checkMobile(newMobile, mobile);
    if(mobileCodesNumber > 0) ctx.throw(400, '此号码已经用于其他用户注册，请检查或更换');
    const smsCode = await dbFn.checkMobileCode(newMobile, code);
    if(!smsCode) ctx.throw(400, '手机验证码错误或过期，请检查');
    await db.UsersPersonalModel.replaceOne({uid: user.uid}, {$set: {mobile: newMobile}});
    await next();
  })
  .get('/resource', async (ctx, next) => {
    const {user} = ctx.data;
    const {db} = ctx;
    const quota = parseInt(ctx.query.quota);
    ctx.data.resources = await db.ResourceModel.find({uid: user.uid}).sort({toc: -1}).limit(quota);
    await next();
  });
module.exports = meRouter;