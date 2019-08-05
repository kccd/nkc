const Router = require('koa-router');
const modifyRouter = new Router();
modifyRouter
	.get('/:acid', async (ctx, next) => {
    const {data, db, params, query} = ctx;
		const {user} = data;
    const {acid} = params;
    const {modifyType} = query;
    data.modifyType = modifyType;
    const activity = await db.ActivityModel.findOnly({acid:acid});
    if(!user || activity.uid !== user.uid){
      ctx.throw(404, "你无权限修改活动")
    }
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
		const {ActivityModel, SettingModel, ActivityHistoryModel} = db;
		const {user} = data;
		const {post} = body;
    const {acid, activityTitle, address, sponsor, limitNum, enrollStartTime, enrollEndTime, holdStartTime, holdEndTime, posterId, description, contactNum, continueTofull, isnotice, noticeContent} = post;
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
    const activityHistory = new ActivityHistoryModel({
			acid,
			activityTitle,
			description,
			posterId,
			address,
			sponsor,
			limitNum,
			enrollStartTime,
			enrollEndTime,
			holdStartTime,
			holdEndTime,
			contactNum,
			continueTofull,
			uid: user.uid
    })
    await activityHistory.save();
    // 发送通知
    // 获取该活动全部报名者
    let obj = {
      type: "activityChangeNotice",
      content: noticeContent,
      cTitle: "【活动系统】",
      acid: acid
    }
    if(isnotice == true){
      for(let uid of activity.signUser){
        const _id = await db.SettingModel.operateSystemID('messages', 1);
        const message = db.MessageModel({
          _id,
          ty: 'STU',
          c: obj,
          r: uid,
          ip: ctx.address,
          port: ctx.port
        });
        await message.save();    

        // 判断是否已创建聊天
        // let targetChat = await db.CreatedChatModel.findOne({uid: uid, tUid: user.uid});

        // if(!targetChat) {
        //   targetChat = db.CreatedChatModel({
        //     _id: await db.SettingModel.operateSystemID('createdChat', 1),
        //     uid: uid,
        //     tUid: user.uid,
        //     lmId: message._id
        //   });
        //   await targetChat.save();
        // }
        // const total = await db.MessageModel.count({$or: [{s: user.uid, r: uid}, {r: user.uid, s: uid}]});

        // await targetChat.update({
        //   tlm: message.tc,
        //   lmId: message._id,
        //   total,
        //   unread: await db.MessageModel.count({s: user.uid, r: uid, vd: false})
        // });
        // const message_ = message.toObject();
        await ctx.redis.pubMessage(message);
      }
    }
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
    await next();
  })
  .patch('/:acid', async(ctx, next) => {
    const {data, db, params, query, body} = ctx;
		const {user} = data;
    const {acid} = params;
    const {noticeContent} = body;
    const {ActivityModel } = db;
    const activity = await ActivityModel.findOne({"acid":acid});
    if(user && parseInt(user.uid) !== parseInt(activity.uid)){
      return ctx.throw(404,"您无权代表主办方发送通知");
    }
    if(activity && activity.activityType == "close"){
      return ctx.throw(400, "该活动已经被关闭")
    }
    for(let uid of activity.signUser){
      const _id = await db.SettingModel.operateSystemID('messages', 1);
      const message = db.MessageModel({
        _id,
        ty: 'UTU',
        c: noticeContent,
        s: user.uid,
        r: uid,
        ip: ctx.address,
        port: ctx.port
      });
      await message.save();    

      // 判断是否已创建聊天
      let targetChat = await db.CreatedChatModel.findOne({uid: uid, tUid: user.uid});

      if(!targetChat) {
        targetChat = db.CreatedChatModel({
          _id: await db.SettingModel.operateSystemID('createdChat', 1),
          uid: uid,
          tUid: user.uid,
          lmId: message._id
        });
        await targetChat.save();
      }
      const total = await db.MessageModel.count({$or: [{s: user.uid, r: uid}, {r: user.uid, s: uid}]});

      await targetChat.update({
        tlm: message.tc,
        lmId: message._id,
        total,
        unread: await db.MessageModel.count({s: user.uid, r: uid, vd: false})
      });
      const message_ = message.toObject();
      await ctx.redis.pubMessage(message_);
    }
    await next();
  })
module.exports = modifyRouter;