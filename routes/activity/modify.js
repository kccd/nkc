const Router = require('koa-router');
const modifyRouter = new Router();
modifyRouter
	.get('/:acid', async (ctx, next) => {
    const {data, db, params, query} = ctx;
		const {user} = data;
    const {acid} = params;
    const activity = await db.ActivityModel.findOnly({acid:acid});
    if(!user || activity.uid !== user.uid){
      ctx.throw(404, "你无权限修改活动")
    }
    let c;
    if(activity){
      c = activity.description;
    }
    const post = {
      c:c,
      l:'html'
    }
    activity.description = ctx.nkcModules.nkc_render.experimental_render(post);
    // 拓展聊天
    activity.posts = await activity.extendPost();
    if(user){
      activity.user = await activity.extendUser();
      activity.userPersonal = await activity.extendUserPersonal();
    }
    data.activity = activity;
    const activityApplyList = await db.ActivityApplyModel.find({acid:acid})
    data.activityApplyList = activityApplyList;
		ctx.template = 'activity/activityModify.pug';
		await next();
  })
  .post('/:acid', async (ctx, next) => {
		const {data, params, db, body, address: ip, query, nkcModules} = ctx;
		const {ActivityModel, SettingModel} = db;
		const {user} = data;
		const {post} = body;
    const {acid, activityTitle, address, sponsor, limitNum, enrollStartTime, enrollEndTime, holdStartTime, holdEndTime, posterId, description, contactNum, continueTofull} = post;
    const activity = await ActivityModel.findOne({"acid":acid});
    if(activity.activityType == "close"){
      return ctx.throw(400,"该活动已被关闭，不可修改")
    }
    if(activity){
      activity.activityTitle = activityTitle;
      activity.enrollStartTime = enrollStartTime;
      activity.enrollEndTime = enrollEndTime;
      activity.holdStartTime = holdStartTime;
      activity.holdEndTime = holdEndTime;
      activity.address = address;
      activity.posterId = posterId;
      activity.sponsor = sponsor;
      activity.contactNum = contactNum;
      activity.limitNum = limitNum;
      activity.continueTofull = continueTofull;
      activity.description = description;
    }
		await activity.save();
    await next();
  })
  .del('/:acid', async(ctx, next) => {
    const {data, db, params, query, body} = ctx;
		const {user} = data;
    const {acid} = params;
    const {post} = body;
    const activity = await db.ActivityModel.findOne({"acid":acid});
    if(user && parseInt(user.uid) !== parseInt(activity.uid)){
      return ctx.throw(404,"您无权关闭别人的活动");
    }
    if(activity && activity.activityType == "close"){
      return ctx.throw(400, "该活动已经被关闭")
    }
    if(activity){
      activity.activityType = "close";
      activity.save();
    }
    // const activityApply = await db.ActivityApplyModel.findOne({"uid":user.uid,"acid":acid});
    // if(activityApply){
    //   activityApply.applyStatus = "cancel";
    //   activityApply.cancelReason = "passive";
    //   activityApply.cancelToc = new Date();
    //   await activityApply.save();
    // }
    await next();
  })
module.exports = modifyRouter;