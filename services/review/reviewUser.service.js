const UserAuditModel = require('../../dataModels/UserAuditModel');
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
}

module.exports = {
  reviewUserService: new ReviewUserService(),
};
