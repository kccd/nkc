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
  }
}
