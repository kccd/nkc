const documentStatus = {
  default: 'default', // 默认状态 创建了但未进行任何操作
  disabled: 'disabled', // 禁用
  unknown: 'unknown', // 未审核
  normal: 'normal', // 正常状态 能被所有用户查看的文档
  faulty: 'faulty', // 退修
  cancelled: 'cancelled', // 取消发布
  deleted: 'deleted', // 已删除
};

const documentTypes = {
  stable: 'stable',
  beta: 'beta',
  betaHistory: 'betaHistory',
  stableHistory: 'stableHistory',
};

const documentSources = {
  article: 'article',
  draft: 'draft',
  comment: 'comment',
  moment: 'moment',
};

module.exports = {
  documentStatus,
  documentSources,
  documentTypes,
};
