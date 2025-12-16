const UserAuditModel = require('../../dataModels/UserAuditModel');
const UsersScoreLogModel = require('../../dataModels/UsersScoreLogModel');
const KcbsRecordModel = require('../../dataModels/KcbsRecordModel');
const UsersGeneralModel = require('../../dataModels/UsersGeneralModel');
const socket = require('../../nkcModules/socket');
const SettingModel = require('../../dataModels/SettingModel');
const MessageModel = require('../../dataModels/MessageModel');
const SecretBehaviorModel = require('../../dataModels/SecretBehaviorModel');
const UserModel = require('../../dataModels/UserModel');
const apiFunction = require('../../nkcModules/apiFunction');
const { userAuditStatus } = require('../../settings/audit');
const { userInfoService } = require('../user/userInfo.service');
class ReviewUserService {
  getPendingReviewUsers = async (props) => {
    const { page, perPage } = props;
    const match = {
      status: userAuditStatus.pending,
    };
    const count = await UserAuditModel.countDocuments(match);
    const paging = apiFunction.paging(page, count, perPage);
    const userAudits = await UserAuditModel.find(match)
      .sort({ toc: -1 })
      .skip(paging.start)
      .limit(paging.perpage);
    const auditsUid = new Set();
    for (const item of userAudits) {
      auditsUid.add(item.uid);
    }
    const usersObject = await userInfoService.getUsersBaseInfoObjectByUserIds([
      ...auditsUid,
    ]);
    const results = [];
    for (const userAudit of userAudits) {
      results.push({
        type: 'userAudit',
        userAudit,
        user: usersObject[userAudit.uid],
      });
    }
    return {
      data: results,
      paging,
    };
  };

  markUserAuditReviewStatus = async (props) => {
    const { user, ctx } = props;
    const { auditId, pass, reason, remindUser, violation } = user;
    // 查找对应审核，仅仅查找：pending状态
    const auditStatus = UserAuditModel.getAuditStatus();
    const userAudit = await UserAuditModel.findOne({
      _id: auditId,
      status: auditStatus.pending,
    });
    if (!userAudit) {
      return;
    }

    if (pass) {
      if (userAudit.username) {
        const tUser = await UserModel.findOne({ uid: userAudit.uid });
        const behavior = {
          oldUsername: tUser.username,
          oldUsernameLowerCase: tUser.usernameLowerCase,
          newUsername: userAudit.username,
          newUsernameLowerCase: userAudit.username.toLowerCase(),
          uid: userAudit.uid,
          type: 'modifyUsername',
          ip: userAudit.ip,
          port: userAudit.port,
        };
        await SecretBehaviorModel(behavior).save();
      }
      await UserAuditModel.approve(userAudit._id, ctx.state.uid);
      const message = await MessageModel({
        _id: await SettingModel.operateSystemID('messages', 1),
        r: userAudit.uid,
        ty: 'STU',
        c: {
          type: 'userAuditApproved',
          link: `/u/${userAudit.uid}/settings`,
        },
      });
      await message.save();
      await socket.sendMessageToUser(message._id);
    } else {
      await UserAuditModel.reject(userAudit._id, ctx.state.uid, reason || '');
      if (userAudit.username) {
        let usernameSettings = await SettingModel.getSettings('username');
        let usersGeneral = await UsersGeneralModel.findOnly({
          uid: userAudit.uid,
        });
        const kcbsRecord = await KcbsRecordModel.findOne({
          type: 'modifyUsernameAudit',
          from: userAudit.uid,
          to: 'bank',
        }).sort({ toc: -1 });
        if (
          !usernameSettings.free &&
          usersGeneral.modifyUsernameCount - 1 >= usernameSettings.freeCount &&
          kcbsRecord
        ) {
          // 归还kcb
          const scoreObject = await SettingModel.getScoreByOperationType(
            'usernameScore',
          );
          await KcbsRecordModel({
            _id: await SettingModel.operateSystemID('kcbsRecords', 1),
            type: 'rejectUsernameAudit',
            from: 'bank',
            to: userAudit.uid,
            num: kcbsRecord.num,
            // 审核人的ip
            ip: ctx.address,
            port: ctx.port,
            scoreType: scoreObject.type,
          }).save();
        }
        if (usersGeneral.modifyUsernameCount - 1 >= 0) {
          await UsersGeneralModel.updateOne(
            { uid: userAudit.uid },
            {
              $inc: {
                modifyUsernameCount: -1,
              },
            },
          );
        }
      }
      if (violation) {
        const targetUser = await UserModel.findOne({ uid: userAudit.uid });
        //新增违规记录
        await UsersScoreLogModel.insertLog({
          user: targetUser,
          type: 'score',
          typeIdOfScoreChange: 'violation',
          port: ctx.port,
          ip: ctx.address,
          key: 'violationCount',
          description: reason || '拒绝基本资料修改并标记违规',
        });
      }
      //提醒用户
      if (remindUser) {
        // 发送消息需要兼容模版类型
        const message = await MessageModel({
          _id: await SettingModel.operateSystemID('messages', 1),
          r: userAudit.uid,
          ty: 'STU',
          c: {
            delType: 'disabled',
            violation,
            type: 'userAuditRejected',
            auditId: userAudit._id,
            reason,
          },
        });
        await message.save();
        await socket.sendMessageToUser(message._id);
      }
    }
  };
}

module.exports = {
  reviewUserService: new ReviewUserService(),
};
