const userAuditStatus = {
  pending: 'pending', // 待审核
  approved: 'approved', // 审核通过
  rejected: 'rejected', // 审核拒绝
  revoked: 'revoked', // 撤销后可重新提交
};

module.exports = {
  userAuditStatus,
};
