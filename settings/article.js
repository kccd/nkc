const articleSources = {
  column: 'column',
  zone: 'zone',
};

const articleStatus = {
  normal: 'normal', // 正常
  default: 'default', // 默认状态 创建了article但未进行任何操作
  disabled: 'disabled', //禁用
  faulty: 'faulty', //退修
  unknown: 'unknown', // 未审核
  deleted: 'deleted', //article被删除
  cancelled: 'cancelled', // 取消发布
};

module.exports = {
  articleSources,
  articleStatus,
};
