const MomentModel = require('../../dataModels/MomentModel');
const SubscribeModel = require('../../dataModels/SubscribeModel');
const { ThrowCommonError } = require('../../nkcModules/error');

class MomentCheckerService {
  async checkMomentPermission(readerUid, moment, hasReviewPermission) {
    const {
      status: momentStatus,
      visibleType: momentVisibleType,
      uid: momentUid,
    } = moment;
    const {
      normal: normalMomentStatus,
      deleted: deleteMomentStatus,
      disabled: disabledMomentStatus,
    } = await MomentModel.getMomentStatus();
    const { own, attention } = await MomentModel.getMomentVisibleType();

    if (hasReviewPermission) {
      // 管理员不做限制
      // 但请确保前端页面能显示内容的实际状态，包括是否删除、谁可见等
    } else if (readerUid === momentUid) {
      // 阅读自己的
      if (momentStatus === deleteMomentStatus) {
        // 被删除了
        ThrowCommonError(403, '内容已被删除');
      }
    } else {
      // 阅读别人的
      if (momentStatus !== normalMomentStatus) {
        // 状态异常
        if (momentStatus === deleteMomentStatus) {
          // 被删除
          ThrowCommonError(403, '内容已被删除');
        } else if (momentStatus === disabledMomentStatus) {
          // 被屏蔽
          ThrowCommonError(403, '内容已被屏蔽');
        } else {
          // 其他
          ThrowCommonError(403, '权限不足');
        }
      } else {
        // 状态正常
        if (momentVisibleType === own) {
          // 仅自己可见
          ThrowCommonError(403, '内容仅作者自己可见');
        } else if (momentVisibleType === attention) {
          // 仅关注的人可见
          const subUid = await SubscribeModel.getUserSubUsersId(readerUid);
          if (!subUid.includes(momentUid)) {
            ThrowCommonError(403, '内容仅粉丝可见');
          }
        }
      }
    }
  }
}

module.exports = {
  momentCheckerService: new MomentCheckerService(),
};
