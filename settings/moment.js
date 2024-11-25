const momentModes = {
  plain: 'plain',
  rich: 'rich',
};

// 包含所有document的状态
// 并且额外包含 deleted, cancelled
const momentStatus = {
  // document status
  default: 'default', // 默认状态
  disabled: 'disabled', // 禁用
  normal: 'normal', // 正常状态 能被所有用户查看的文档
  faulty: 'faulty', // 退修
  unknown: 'unknown', // 需要审核
  // 额外
  deleted: 'deleted', // 已删除
  cancelled: 'cancelled', // 取消发表
};

const momentVisibleType = {
  own: 'own',
  attention: 'attention',
  everyone: 'everyone',
};

module.exports = {
  momentModes,
  momentStatus,
  momentVisibleType,
};
