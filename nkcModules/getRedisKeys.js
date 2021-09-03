module.exports = (type, v1, v2) => {
  switch(type) {
    case 'forumsId': return `forums:id`;
    case 'forumData': return `forum:${v1}`;
    case 'visibilityForumsId': return `forums:visibilityForumsId`;
    case 'isVisibilityNCCForumsId': return `forums:isVisibilityNCCForumsId`;
    case 'accessibleForumsId': return `forums:accessibleForumsId`;
    case 'displayOnParentForumsId': return `forums:displayOnParentForumsId`;
    case 'displayOnSearchForumsId': return `forums:displayOnSearchForumsId`;
    case 'scoreOperation': return `scoreOperation:${v1}:${v2}`;
    case 'searchScoreOperation': return `scoreOperation:*`;
    case 'numberOfOtherUserOperation': return `user:${v1}:numberOfOtherUserOperation`; // 用户被阅读量等的数量
    case 'timeToSetOtherUserOperationNumber': return `user:${v1}timeToSetOtherUserOperationNumber`; // 更新阅读量
    case 'operationStatistics': return `statistics:operation:${v1}`; // 操作统计
    case 'IPBlacklist': return `IPBlacklist`
  }
}
