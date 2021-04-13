const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const {nkcModules, query, data, db} = ctx;
    const {page = 0, t = 'pending'} = query;
    if(!['resolved', 'rejected', 'pending'].includes(t)) {
      ctx.throw(400, `type error`);
    }
    const match = {
      status: t
    };
    const count = await db.SecurityApplicationModel.countDocuments(match);
    const paging = nkcModules.apiFunction.paging(page, count);
    const applications = await db.SecurityApplicationModel
      .find(match).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    const usersId = [], usersObj = {};
    const ipToken = [];
    for(const a of applications) {
      usersId.push(a.uid);
      if(a.mUid) usersId.push(a.mUid);
      ipToken.push(a.ip);
    }
    const users = await db.UserModel.find({uid: {$in: usersId}});
    const ips = await db.IPModel.getIPByTokens(ipToken);
    for(const u of users) {
      usersObj[u.uid] = {
        avatar: u.avatar,
        uid: u.uid,
        username: u.username
      };
    }
    data.applications = [];
    for(const a of applications) {
      const {
        _id, status, toc, addresses, oldPhoneNumber, newPhoneNumber,
        ip, port, uid, mUid, remarks, reason
      } = a;
      const user = usersObj[uid];
      let _ip = ips[ip];
      if(_ip) {
        const ipInfo = await db.IPModel.getIPInfoFromLocal(_ip);
        _ip = `${_ip}(${ipInfo.location})`;
      }
      const application = {
        _id,
        status,
        toc,
        addresses,
        oldPhoneNumber,
        newPhoneNumber,
        user,
        port,
        remarks,
        reason,
        ip: _ip || null,
        mUser: null
      };
      if(mUid) {
        application.mUser = usersObj[mUid] || null;
      }
      data.applications.push(application);
    }
    data.paging = paging;
    data.t = t;
    data.nav = 'securityApplication';
    ctx.template = 'nkc/securityApplication/securityApplication.pug';
    await next();
  })
  .post('/', async (ctx, next) => {
    const {nkcModules, body, db, data, state} = ctx;
    const {checkString} = nkcModules.checkData;
    let {applicationId, status, reason, remarks} = body;
    const application = await db.SecurityApplicationModel.findById(applicationId);
    if(!application) ctx.throw(404, `未找到相关数据 id: ${applicationId}`);
    if(application.status !== 'pending') ctx.throw(400, `当前申诉已被处理，请刷新`);
    if(!['resolved', 'rejected'].includes(status)) ctx.throw(400, `status error`);
    if(status === 'rejected') {
      checkString(reason, {
        name: '理由',
        minLength: 1,
        maxLength: 1000
      });
      remarks = '';
    } else {
      reason = '';
    }
    let messageType;
    if(status === 'resolved') {
      // 修改用户的手机号并存修改记录
      await db.UsersPersonalModel.modifyUserPhoneNumber({
        uid: application.uid,
        ip: await db.IPModel.getIPByToken(application.ip),
        port: application.port,
        phoneNumber: application.newPhoneNumber,
      });
      await db.UsersPersonalModel.modifyVerifyPhoneNumberTime(application.uid);
      messageType = 'securityApplicationResolved';
    } else {
      messageType = 'securityApplicationRejected';
    }
    // 更新申请表的状态
    await application.updateOne({
      mUid: state.uid,
      status,
      reason,
      remarks,
      tlm: Date.now(),
    });

    // 发送短消息通知
    const message = db.MessageModel({
      _id: await db.SettingModel.operateSystemID('messages', 1),
      r: application.uid,
      ty: 'STU',
      c: {
        type: messageType,
        securityApplicationId: application._id,
      }
    });
    await message.save();
    await ctx.redis.pubMessage(message);
    await next();
  });
module.exports = router;
