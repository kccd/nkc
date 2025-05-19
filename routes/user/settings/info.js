const Router = require('koa-router');
const {
  userDescCheckerService,
} = require('../../../services/user/userDescChecker.service');
const infoRouter = new Router();
const { OnlyUnbannedUser } = require('../../../middlewares/permission');
const {
  usernameCheckerService,
} = require('../../../services/user/usernameChecker.service');
infoRouter.put('info', OnlyUnbannedUser(), async (ctx, next) => {
  const { data, body, nkcModules, db } = ctx;
  const { user } = data;
  const { description, postSign, newUsername, type } = body.fields;
  const { avatarFile, bannerFile, homeBannerFile } = body.files;
  if (!['save', 'revoked'].includes(type)) {
    ctx.throw(400, `提交类型错误:${type}`);
  }
  const userAudit = {
    avatar: '',
    banner: '',
    homeBanner: '',
    username: '',
    description: '',
  };
  // 查询是否有待审核的记录
  const auditStatus = db.UserAuditModel.getAuditStatus();
  const userAudit_ = await db.UserAuditModel.findOne({
    uid: user.uid,
    status: auditStatus.pending,
  }).sort({ toc: -1 });
  if (!userAudit_ && type === 'revoked') {
    ctx.throw(400, '当前没有待审核的请求可撤销,请刷新后重试');
  }
  if (userAudit_ && type === 'save') {
    ctx.throw(400, '已有待审核的修改请求，无法重复提交');
  }
  if (type === 'save') {
    const { contentLength } = ctx.tools.checkString;
    await userDescCheckerService.checkUserDesc(description);
    if (contentLength(postSign) > 1000) {
      ctx.throw(400, '文章签名不能超过500个字。');
    }
    // 暂时直接修改
    user.postSign = postSign;
    await user.save();
    userAudit.description = description;
    //改头像
    if (avatarFile) {
      const { _id } = await db.AttachmentModel.saveUserAudit(
        user.uid,
        avatarFile,
        'userAvatar',
      );
      userAudit.avatar = _id;
    }
    if (bannerFile) {
      const { _id } = await db.AttachmentModel.saveUserAudit(
        user.uid,
        bannerFile,
        'userBanner',
      );
      userAudit.banner = _id;
    }
    if (homeBannerFile) {
      const { _id } = await db.AttachmentModel.saveUserAudit(
        user.uid,
        homeBannerFile,
        'userHomeBanner',
      );
      userAudit.homeBanner = _id;
    }
    // 校验用户名合法性
    if (newUsername) {
      if (user.username === newUsername) {
        ctx.throw(400, '新用户名不能与旧用户名相同');
      }
      await usernameCheckerService.checkNewUsername(newUsername, user.uid);
      //在待审核列表中是否存在同名修改
      const sameNameAudit = await db.UserAuditModel.findOne({
        username: newUsername,
        status: auditStatus.pending,
      });
      if (sameNameAudit) {
        ctx.throw(400, '此用户名已经被其他人占用');
      }
      // 创建一个用户申请修改用户名的行为记录
      const behavior = {
        oldUsername: user.username,
        oldUsernameLowerCase: user.usernameLowerCase,
        uid: user.uid,
        type: 'modifyUsernameAudit',
        ip: ctx.address,
        port: ctx.port,
      };
      // 验证用户的积分
      const { needScore, scoreObject } =
        await db.UserModel.checkModifyUsernameScore(user.uid);

      if (needScore && needScore > 0) {
        await db
          .KcbsRecordModel({
            _id: await db.SettingModel.operateSystemID('kcbsRecords', 1),
            type: 'modifyUsernameAudit',
            from: user.uid,
            to: 'bank',
            num: needScore,
            ip: ctx.address,
            port: ctx.port,
            scoreType: scoreObject.type,
          })
          .save();
      }
      behavior.newUsername = newUsername;
      behavior.newUsernameLowerCase = newUsername.toLowerCase();
      await db.SecretBehaviorModel(behavior).save();
      await db.UsersGeneralModel.updateOne(
        { uid: user.uid },
        {
          $inc: {
            modifyUsernameCount: 1,
          },
        },
      );
      userAudit.username = newUsername;
    }
  }
  if (Object.values(userAudit).some((value) => value !== '')) {
    if (!userAudit_ && type === 'save') {
      await db.UserAuditModel.submit({ uid: user.uid, changes: userAudit });
    }
  }
  if (userAudit_ && type === 'revoked') {
    // ===》revoked,撤销审核
    if (userAudit_.username) {
      // 创建一个用户撤销修改用户名的行为记录
      const behavior = {
        oldUsername: user.username,
        oldUsernameLowerCase: user.usernameLowerCase,
        uid: user.uid,
        type: 'revokeUsernameAudit',
        ip: ctx.address,
        port: ctx.port,
      };
      let usernameSettings = await db.SettingModel.getSettings('username');
      let usersGeneral = await db.UsersGeneralModel.findOnly({ uid: user.uid });
      const kcbsRecord = await db.KcbsRecordModel.findOne({
        type: 'modifyUsernameAudit',
        from: user.uid,
        to: 'bank',
      }).sort({ toc: -1 });
      if (
        !usernameSettings.free &&
        usersGeneral.modifyUsernameCount - 1 >= usernameSettings.freeCount &&
        kcbsRecord
      ) {
        // 归还kcb
        const scoreObject = await db.SettingModel.getScoreByOperationType(
          'usernameScore',
        );
        await db
          .KcbsRecordModel({
            _id: await db.SettingModel.operateSystemID('kcbsRecords', 1),
            type: 'revokeUsernameAudit',
            from: 'bank',
            to: user.uid,
            num: kcbsRecord.num,
            ip: ctx.address,
            port: ctx.port,
            scoreType: scoreObject.type,
          })
          .save();
      }
      behavior.newUsername = userAudit_.username;
      behavior.newUsernameLowerCase = userAudit_.username.toLowerCase();
      await db.SecretBehaviorModel(behavior).save();
      if (usersGeneral.modifyUsernameCount - 1 >= 0) {
        await db.UsersGeneralModel.updateOne(
          { uid: user.uid },
          {
            $inc: {
              modifyUsernameCount: -1,
            },
          },
        );
      }
    }
    await db.UserAuditModel.revoke(userAudit_._id);
  }

  await next();
});
module.exports = infoRouter;
