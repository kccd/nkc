const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const fundApplicationFormSchema = new Schema({
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
    /*
    {
      purpose: [String],
      money: [Number]
    }
    */
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
  reviseCount: {
    type: Number,
    required: true
  },
  applicationStatus: {
    type: Number,
    default: 0
    /*0000001 1   通过好友支持
    * 0000011 3   通过项目审核（等待用户信息审核）
    * 0000111 4   通过用户信息审核（等待放款）
    * 0001111 15   放款成功（等待结项）
    * 0011111 31  已结项
    * 0111111 63  研发成功（等待评优）
    * 1111111 127 优秀项目（完成）
    */
  },
  auditStatus: {
    type: Number,
    default: 0
    /*
    * 0001 1  提交审核（等待审核）
    * 0011 3  正在审核（锁定，等待审核结果）
    * 0111 7  审核完成
    * 1111 15 审核通过
    * */
  },
  lock: {
    uid: {
      type: String,
      default: ''
    },
    timeToOpen: {
      type: Date,
      default: Date.now
    },
    timeToClose: {
      type: Date,
      default: Date.now
    },
    reason: {
      type: String,
      default: ''
    }
  },
  supportUsers: {
    type: [String],
    default: []
  },
  result: {
    succeeded: {
      type: Boolean,
      default: true
    },
    thread: {
      type: [String],
      default: []
    },
    paper: {
      type: [String],
      default: []
    }
  }
}, {
  collection: 'fundApplicationForms'
});

const FundApplicationFormModel = mongoose.model('fundApplicationForms', fundApplicationFormSchema);
module.exports = FundApplicationFormModel;