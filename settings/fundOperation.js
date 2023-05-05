const fundOperationTypes = {
  report: 'report', // 申请人报告的进度
  system: 'system', // 系统操作，未区分类型的操作
  submitApplication: 'submitApplication', // 申请人提交申请表
  userInfoNotApproved: 'userInfoNotApproved', // 用户信息未通过审核
  projectInfoNotApproved: 'projectInfoNotApproved', // 项目信息未通过审核
  budgetNotApproved: 'budgetNotApproved', // 预算未通过审核
  userInfoApproved: 'userInfoApproved', // 用户信息通过审核
  projectInfoApproved: 'projectInfoApproved', // 项目信息通过审核
  budgetApproved: 'budgetApproved', // 预算通过审核
  notApprovedByAdmin: 'notApprovedByAdmin', // 未通过管理员审核
  approvedByAdmin: 'approvedByAdmin', // 通过管理员审核
  applyDisbursement: 'applyDisbursement', // 申请拨款
  disbursementApproved: 'disbursementApproved', // 拨款申请通过审核
  disbursementNotApproved: 'disbursementNotApproved', // 拨款申请未通过
  disbursementSuccess: 'disbursementSuccess', // 拨款成功
  disbursementFailed: 'disbursementFailed', // 拨款失败
  confirmReceipt: 'confirmReceipt', // 确认收款
  submitFinalReport: 'submitFinalReport', // 提交结题报告
  finalReportNotApproved: 'finalReportNotApproved', // 结题报告未通过审核
  finalReportApproved: 'finalReportApproved', // 结题报告通过审核
  voteFor: 'voteFor', // 用户赞成
  voteAgainst: 'voteAgainst', // 用户反对
  refund: 'refund', // 申请人退款
  applicantAbandoned: 'applicantAbandoned', // 申请人放弃申报
  refuse: 'refuse', // 已被永久拒绝
  cancelRefuse: 'cancelRefuse', // 取消永久拒绝
  modificationTimeout: 'modificationTimeout', // 申请人修改超时
  terminated: 'terminated', // 项目已被终止
  applicantWithdrawn: 'applicantWithdrawn', // 已被申请人撤回
};

const fundOperationStatus = {
  disabled: 'disabled', // 被屏蔽
  deleted: 'deleted', // 被删除
  normal: 'normal', // 正常
};

module.exports = {
  fundOperationTypes,
  fundOperationStatus,
};
