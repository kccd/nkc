const mongoose = require('../settings/database');
const Schema = mongoose.Schema;
const manageBehaviorSchema = new Schema(
  {
    operationId: {
      type: String,
      // required: true,
      index: 1,
      // enum: ['bindMobile', 'bindEmail', 'changeMobile', 'changeEmail', 'changeUsername', 'changePassword']
    },
    toUid: {
      type: String,
    },
    uid: {
      type: String,
      // required: true,
      index: 1,
    },
    ip: {
      type: String,
      // required: true,
      index: 1,
    },
    port: {
      type: String,
      // required: true
    },
    para: {
      type: Schema.Types.Mixed,
    },
    tlm: {
      type: Date,
      index: 1,
    },
    toc: {
      type: Date,
      default: Date.now,
      index: 1,
    },
    // 说明
    desc: {
      type: String,
      default: '',
    },
  },
  {
    collection: 'manageBehaviors',
  },
);

manageBehaviorSchema.pre('save', function (next) {
  if (!this.tlm) {
    this.tlm = this.toc;
  }
  next();
});

manageBehaviorSchema.methods.extendUser = async function () {
  const UserModel = mongoose.model('users');
  let user;
  if (this.uid) {
    const u = await UserModel.findOne({ uid: this.uid });
    if (u) {
      user = u;
    }
  }
  return (this.user = user);
};

manageBehaviorSchema.methods.extendToUser = async function () {
  const UserModel = mongoose.model('users');
  let toUser;
  if (this.toUid) {
    const u = await UserModel.findOne({ uid: this.toUid });
    if (u) {
      toUser = u;
    }
  }
  return (this.toUser = toUser);
};

manageBehaviorSchema.methods.extendOperationName = async function () {
  const OperationModel = mongoose.model('operations');
  let operationData;
  if (this.operationId) {
    const o = await OperationModel.findOne({ _id: this.operationId });
    if (o) {
      operationData = o;
    }
  }
  return (this.operationData = operationData);
};

manageBehaviorSchema.statics.insertLog = async (props) => {
  const ManageBehaviorModel = mongoose.model('manageBehaviors');
  const { uid, toUid, operationId, toc, ip, port, desc = '' } = props;
  const log = ManageBehaviorModel({
    uid,
    toUid,
    operationId,
    toc,
    ip,
    port,
    desc,
  });
  await log.save();
};

const ManageBehaviorModel = mongoose.model(
  'manageBehaviors',
  manageBehaviorSchema,
);

module.exports = ManageBehaviorModel;
