const Router = require('koa-router');
const singleRouter = new Router();
singleRouter
	.get('/:acid', async (ctx, next) => {
    const {data, db, params, query} = ctx;
		const {user} = data;
    const {acid} = params;
    const {type, hid, token} = query;
    data.type = type;
    data.hid = hid;
    // 权限判断		
    if(token){
      let share = await db.ShareModel.findOne({"token":token});
      if(!share) ctx.throw(403, "无效的token");
      // 获取分享限制时间
      let shareLimitTime;
      let allShareLimit = await db.ShareLimitModel.findOne({"shareType":"all"});
      let activityShareLimit = await db.ShareLimitModel.findOne({"shareType":"activity"});
      if(activityShareLimit){
        shareLimitTime = activityShareLimit.shareLimitTime;
      }else{
        shareLimitTime = allShareLimit.shareLimitTime;
      }
      let shareTimeStamp = parseInt(new Date(share.toc).getTime());
      let nowTimeStamp = parseInt(new Date().getTime());
      if(nowTimeStamp - shareTimeStamp > 1000*60*60*shareLimitTime){
        await db.ShareModel.update({"token": token}, {$set: {tokenLife: "invalid"}});
      }
      if(share.shareUrl.indexOf(ctx.path) == -1) ctx.throw(403, "无效的token")
    }
    const activity = await db.ActivityModel.findOnly({acid:acid});
    if(activity.activityType == "close"){
      return ctx.throw(403, "该活动已被活动发布者被关闭")
    }
    // 获取报名信息
    // 拓展聊天
    activity.posts = await activity.extendPost();
    if(user){
      activity.user = await activity.extendUser();
      activity.userPersonal = await activity.extendUserPersonal();
      const applyInfo = await db.ActivityApplyModel.findOne({acid: acid, uid:user.uid});
      data.applyInfo = applyInfo
    }
    // 拓展历史
    activity.historys = await activity.extendHistorys();
    if(data.type == 'history'){
      data.history = await db.ActivityHistoryModel.findOne({_id:hid})
    }
    data.activity = activity.toObject();
		ctx.template = 'activity/activitySingle.pug';
		await next();
  })
  .post('/:acid', async (ctx, next) => {
    const {data, db, query, body, params} = ctx;
    const {user} = data;
    const {ActivityModel, ActivityApplyModel, UsersModel} = db;
    const {post} = body;
    const {acid} = post;
    if(!user){
      ctx.throw(400, "请前往注册");
    }
    const activity = await ActivityModel.findOne({acid});
    if(parseInt(user.id) == parseInt(activity.uid)){
      ctx.throw(400, "不可以报名自己发起的活动")
    }
    if(activity && activity.limitNum !==0 && activity.signUser.length >= activity.limitNum && activity.continueTofull == false){
      ctx.throw(400, "活动报名人数已达上限");
    }
    if(activity.signUser.includes(user.uid)){
      ctx.throw(400, "请勿重复报名");
    }
    const isApply = await ActivityApplyModel.find({"acid":acid,"uid":user.uid,applyStatus:"success"});
    if(isApply.length !== 0){
      ctx.throw(400, "请勿重复报名");
    }
    const enrollStartTimeStamp = new Date(activity.enrollStartTimeStamp).getTime();
    const enrollEndTimeStamp = new Date(activity.enrollEndTime).getTime();
    const nowTimeStamp = new Date().getTime();
    if(parseInt(nowTimeStamp) < parseInt(enrollStartTimeStamp)){
      ctx.throw(400, "报名尚未开始");
    }
    if(parseInt(nowTimeStamp) > parseInt(enrollEndTimeStamp)){
      ctx.throw(400, "报名已结束");
    }
    if(!activity.signUser.includes(user.uid)){
      activity.signUser.push(user.uid);
      await activity.save()
    }
    if(user){
      post.uid = user.uid;
    }
    const apply = await db.ActivityApplyModel.findOne({"uid":user.uid,"acid":acid});
    if(apply){
      apply.applyStatus = "success";
      apply.enrollInfo = post.enrollInfo;
      await apply.save();
    }else{
      const activityApply = new ActivityApplyModel(post);
      await activityApply.save();
    }
    await next();
  })
  .patch('/:acid', async (ctx, next) => {
    const {data, db, query, body, params} = ctx;
    const {user} = data;
    const {ActivityModel, ActivityApplyModel, UsersModel} = db;
    const {post} = body;
    const {acid} = post;
    if(!user){
      ctx.throw(400, "请前往注册");
    }
    
    const apply = await db.ActivityApplyModel.findOne({"uid":user.uid,"acid":acid});
    await apply.update({enrollInfo: post.enrollInfo})
    // if(!activity.signUser.includes(user.uid)){
    //   activity.signUser.push(user.uid);
    //   await activity.save()
    // }
    // if(user){
    //   post.uid = user.uid;
    // }
    // const apply = await db.ActivityApplyModel.findOne({"uid":user.uid,"acid":acid});
    // if(apply){
    //   apply.applyStatus = "success";
    //   apply.enrollInfo = post.enrollInfo;
    //   await apply.save();
    // }else{
    //   const activityApply = new ActivityApplyModel(post);
    //   await activityApply.save();
    // }
    await next();
  })
  .del('/:acid', async(ctx, next) => {
    const {data, db, params, query} = ctx;
		const {user} = data;
    const {acid} = params;
    const activity = await db.ActivityModel.findOne({"acid":acid});
    if(activity){
      await activity.signUser.remove(user.uid);
      await activity.save();
    }
    const activityApply = await db.ActivityApplyModel.findOne({"uid":user.uid,"acid":acid});
    if(activityApply){
      activityApply.applyStatus = "cancel";
      activityApply.cancelReason = "active";
      activityApply.cancelToc = new Date();
      await activityApply.save();
    }
    await next();
  })
module.exports = singleRouter;