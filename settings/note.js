const noteContentStatus = {
  disabled: 'disabled', //屏蔽
  unknown: 'unknown', //未审核
  normal: 'normal', //正常状态
  deleted: 'deleted', //管理员只操作前面三种状态，最后一种仅限于提供给用户使用
};

const noteContentTypes = {
  post: 'post',
};

module.exports = {
  noteContentStatus,
  noteContentTypes,
};
