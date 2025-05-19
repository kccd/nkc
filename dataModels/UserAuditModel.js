const { ThrowCommonError } = require('../nkcModules/error');
const settings = require('../settings');
const mongoose = require('../settings/database');

// 审核状态枚举
const auditStatus = {
  pending: 'pending', // 待审核
  approved: 'approved', // 审核通过
  rejected: 'rejected', // 审核拒绝
  revoked: 'revoked', // 撤销后可重新提交
};

const schema = new mongoose.Schema(
  {
    _id: String,
    // // 创建时间
    // toc: { type: Date, default: Date.now },
    // 审核通过或拒绝时间
    top: { type: Date, default: null },
    // // 最后修改时间
    // tlm: { type: Date, default: Date.now },
    // 提交人
    uid: { type: String, required: true, index: 1 },
    // 审核人
    reviewer: { type: String, default: '', index: 1 },
    // 审核状态
    status: { type: String, default: auditStatus.pending, index: 1 },
    // 待审核的用户修改内容（中间数据）
    avatar: { type: String, default: '', index: 1 },
    banner: { type: String, default: '', index: 1 },
    homeBanner: { type: String, default: '', index: 1 },
    username: { type: String, default: '' },
    description: { type: String, default: '' },
    // 审核原因（拒绝时填写）
    reason: { type: String, default: '' },
    // 是否自动审核
    autoReviewed: { type: Boolean, default: false },
  },
  {
    collection: 'userAudits',
    // timestamps: false,
    timestamps: {
      createdAt: 'toc', // 自动生成创建时间
      updatedAt: 'tlm', // 自动维护更新时间
    },
  },
);

schema.statics.getNewId = () => new mongoose.Types.ObjectId().toString();

/**
 * 提交新的审核请求
 * @param {Object} options
 * @param {String} options.uid - 提交人ID
 * @param {Object} options.changes - 包含 avatar, banner, homeBanner, username, description
 */
schema.statics.submit = async function ({ uid, changes }) {
  const hasPending = await this.exists({ uid, status: auditStatus.pending });
  if (hasPending) {
    ThrowCommonError(400, '已有待审核的修改请求');
  }
  const id = this.getNewId();
  const rec = new this({
    _id: id,
    uid,
    avatar: changes.avatar || '',
    banner: changes.banner || '',
    homeBanner: changes.homeBanner || '',
    username: changes.username || '',
    description: changes.description || '',
    status: auditStatus.pending,
    autoReviewed: false,
  });
  return rec.save();
};

/**
 * 审核通过
 * @param {String} id - 审核记录ID
 * @param {String} reviewer - 审核人ID
 */
schema.statics.approve = async function (id, reviewer) {
  const elasticSearch = require('../nkcModules/elasticSearch');
  const audit = await this.findById(id);
  if (!audit) {
    ThrowCommonError(400, 'Audit record not found');
  }
  if (audit.status !== auditStatus.pending) {
    ThrowCommonError(400, '只有待审核状态才能批准');
  }
  const UserModel = mongoose.model('users');
  // 更新用户表逻辑
  const { avatar, banner, homeBanner, username, description, uid } = audit;
  const updates = {};
  if (avatar) {
    updates.avatar = avatar;
  }
  if (banner) {
    updates.banner = banner;
  }
  if (homeBanner) {
    updates.homeBanner = homeBanner;
  }
  if (username) {
    updates.username = username;
    updates.usernameLowerCase = username.toLowerCase();
  }
  if (description) updates.description = description;

  if (Object.keys(updates).length) {
    await UserModel.updateOne({ uid }, { $set: updates });
    // refresh ES index
    const user = await UserModel.findOne({ uid });
    await elasticSearch.save('user', user);
  }
  const now = Date.now();
  audit.status = auditStatus.approved;
  audit.reviewer = reviewer;
  audit.top = now;
  return audit.save();
};

/**
 * 审核拒绝
 * @param {String} id - 审核记录ID
 * @param {String} reviewer - 审核人ID
 * @param {String} reason - 拒绝原因
 */
schema.statics.reject = async function (id, reviewer, reason = '') {
  const audit = await this.findById(id);
  if (!audit) {
    ThrowCommonError(400, 'Audit record not found');
  }
  if (audit.status !== auditStatus.pending) {
    ThrowCommonError(400, '只有待审核状态才能拒绝');
  }
  audit.status = auditStatus.rejected;
  audit.reviewer = reviewer;
  audit.reason = reason;
  return audit.save();
};

/**
 * 撤销审核请求，允许重新提交
 * @param {String} id - 审核记录ID
 */
schema.statics.revoke = async function (id) {
  const audit = await this.findById(id);
  if (!audit) {
    ThrowCommonError(400, 'Audit record not found');
  }
  if (![auditStatus.pending, auditStatus.rejected].includes(audit.status)) {
    ThrowCommonError(400, '只有待审核或已拒绝状态才能撤销');
  }
  audit.status = auditStatus.revoked;
  // audit.reviewer = '';
  // audit.reason = '';
  // audit.autoReviewed = false;
  // audit.top = null;
  return audit.save();
};

/**
 * 获取待审核列表
 */
schema.statics.getPendingAudits = function () {
  return this.find({ status: auditStatus.pending }).sort({ toc: 1 });
};

/**
 * 自动审核入口，仅处理 pending 状态==>待完善
 */
schema.statics.runAutoReview = async function () {
  const sensitives = settings.sensitiveWords || [];
  const list = await this.getPendingAudits(50);
  for (const rec of list) {
    const audit = await this.findById(rec._id);
    if (audit.status !== auditStatus.pending) continue;
    let passed = true;
    let reason = '';
    ['username', 'description'].forEach((f) => {
      if (audit[f] && sensitives.find((w) => audit[f].includes(w))) {
        passed = false;
        reason = '包含敏感词';
      }
    });
    if (passed) {
      await this.approve(audit._id, 'system');
    } else {
      audit.autoReviewed = true;
      audit.reason = reason;
      await audit.save();
    }
  }
};

// 获取审核状态列表
schema.statics.getAuditStatus = () => ({ ...auditStatus });

module.exports = mongoose.model('userAudits', schema);
