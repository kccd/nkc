const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const fundApplicationSchema = new Schema({
  _id: Number,
  fundId: {
    type: Number,
    required: true
  },
  uid: {
    type: String,
    required: true,
    index: 1
  },
  budgetMoney: {
    type: [Schema.Types.Mixed],
    required: true
  },
  projectCycle: {
    type: Number,
    required: true
  },
  members: {
    type: [Schema.Types.Mixed],
    default: []
  },
  /*
  {
    uid: String,
    name: String,
    idCard: String,
    idCardPhotoPath: [String],
    lifePhotoPath: [String],
    handheldIdCartPath: [String],
    certPhotoPath: [String]
  }
  */
  thread: {
    type: [String],
    default:[]
  },
  paper: {
    type: [String],
    default: []
  },
  account: {
    paymentMethod: {
      type: String,
      required: true
    },
    number: {
      type: Number,
      required: true
    }
  },
  project: {
    name: {
      type: String,
      required: true
    },
    aim: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    }
  },
  status: {
    checkProject: {
      type: Boolean,
      default: false
    },
    checkUsersMessages: {
      type: Boolean,
      default: false
    },
    transfer: {
      type: Boolean,
      default: false
    }
  },
  reviseCount: {
    type: Number,
    required: true
  },
  applicationStatus: {
    type: Number,
    default: 0
    /*
    * 00001 1   通过项目审核（等待用户信息审核）
    * 00011 3   通过用户信息审核（等待放款）
    * 00111 7   放款成功（等待结项）
    * 01111 15  已结项（等待评优）
    * 11111 31  优秀项目（完成）
    */
  },
  auditStatus: {
    type: Number,
    default: 0
    /*
    * 0001 1  提交审核（等待审核）
    * 0011 3  正在审核（锁定，等待审核结果）
    * 0111 7  审核通过
    * */
  },
  lock: {
    uid: {
      type: String,
      default: ''
    },
    timeStamp: {
      type: Date,
      default: Date.now
    }
  },
  
}, {
  collection: 'fundApplications'
});

const fundApplyModel = mongoose.model('fundApplications', fundApplicationSchema);
module.exports = fundApplyModel;