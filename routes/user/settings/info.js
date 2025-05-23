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
  let needScore, scoreObject;
  const { contentLength } = ctx.tools.checkString;
  await userDescCheckerService.checkUserDesc(description);
  if (contentLength(postSign) > 1000) {
    ctx.throw(400, '文章签名不能超过500个字。');
  }
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
    // 验证用户的积分
    const checkData = await db.UserModel.checkModifyUsernameScore(user.uid);
    needScore = checkData.needScore;
    scoreObject = checkData.scoreObject;
    userAudit.username = newUsername;
  }
  if (user.description !== description) {
    userAudit.description = description;
  }
  if (userAudit.description === '') {
    user.description = description;
  }
  // 暂时直接修改
  user.postSign = postSign;
  await user.save();
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

  if (userAudit_) {
    if (Object.values(userAudit).some((value) => value !== '')) {
      if (!userAudit_.username && userAudit.username) {
        // 创建一个用户申请修改用户名的行为记录
        const behavior = {
          oldUsername: user.username,
          oldUsernameLowerCase: user.usernameLowerCase,
          uid: user.uid,
          type: 'modifyUsernameAudit',
          ip: ctx.address,
          port: ctx.port,
        };
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
      }
      await db.UserAuditModel.revoke(userAudit_._id);
      await db.UserAuditModel.submit({
        uid: user.uid,
        changes: {
          avatar: userAudit.avatar || userAudit_.avatar,
          banner: userAudit.banner || userAudit_.banner,
          homeBanner: userAudit.homeBanner || userAudit_.homeBanner,
          username: userAudit.username || userAudit_.username,
          description: userAudit.description || userAudit_.description,
        },
      });
    }
  } else {
    if (userAudit.username) {
      // 创建一个用户申请修改用户名的行为记录
      const behavior = {
        oldUsername: user.username,
        oldUsernameLowerCase: user.usernameLowerCase,
        uid: user.uid,
        type: 'modifyUsernameAudit',
        ip: ctx.address,
        port: ctx.port,
      };
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
    }
    if (Object.values(userAudit).some((value) => value !== '')) {
      await db.UserAuditModel.submit({ uid: user.uid, changes: userAudit });
    }
  }
  await next();
});
module.exports = infoRouter;
