const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const fundApplicationFormSchema = new Schema({
  _id: Number,
  fundId: {
    type: Number,
    required: true,
    index: 1
  },
  timeToCreate: {
    type: Date,
    default: Date.now,
    index: 1
  },
  timeOfLastRevise: {
    type: Date,
    index: 1
  },
  publicity: {
    timeOfBegin: {
      type: Date,
      default: null,
      index: 1
    },
    timeOfOver: {
      type: Date,
      default: null,
      index: 1
    }
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
  // 延期
  postpone: {
    type: [Number],
    default: [],
    index: 1
  },
  members: {
    type: [Schema.Types.Mixed],
    default: []
  },
  /*
  {
    uid: ****,
    info: {
      name: ****
      idCard: ****
      ...
    }

  }

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
  threads: {
    type: [String],
    default:[]
  },
  papers: {
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
    title: {
      type: String,
      required: true,
      index: 1
    },
    aim: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true,
      index: 1
    },
    supplementary: {
      type: [String],
      default: [],
      index: 1
    }
  },
  applicationStatus: {
    usersSupport: {
      type: Boolean,
      default: null,
      index: 1
    },
    projectPassed: {
      type:Boolean,
      default: null,
      index: 1
    },
    usersMessagesPassed: {
      type: Boolean,
      default: null,
      index: 1
    },
    adminSupport: {
      type: Boolean,
      default: null,
      index: 1
    },
    remittance: {
      type: Boolean,
      default: null,
      index: 1
    },
    complete: {
      type: Boolean,
      default: null,
      index: 1
    },
    successful: {
      type: Boolean,
      default: null,
      index: 1
    },
    excellent: {
      type: Boolean,
      default: null,
      index: 1
    }
  },
  projectLock: {
    status: {
      type: Number,
      default: 0, // 0未提交， 1已提交， 2正在审批， 3审核完成
      index: 1
      /*submitted: {
        type: Boolean,
        default: false
      },
      beingReviewed: {
        type: Boolean,
        default: false
      },
      complete: {
        type: Boolean,
        default: false
      }*/
    },
    uid: {
      type: String,
      default: '',
      index: 1
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
  usersMessagesLock: {
    status: {
      type: Number,
      default: 0, // 0未提交， 1已提交， 2正在审批， 3审核完成
      index: 1
    },
    uid: {
      type: String,
      default: '',
      index: 1
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
  supporter: {
    type: [String],
    default: [],
    index: 1
  },
  objector: {
    type: [String],
    default: [],
    index: 1
  },
  reason: {
    type: String,
    default: ''
  },
  result: {
    thread: {
      type: [String],
      default: [],
      index: 1
    },
    paper: {
      type: [String],
      default: [],
      index: 1
    }
  },
  comments: {
    type: [String],
    default: [],
    index: 1
  }
}, {
  collection: 'fundApplicationForms'
});

const match = (obj) => {
  const {
    pStatus,
    uStatus,
    usersSupport,
    projectPassed,
    usersMessagesPassed,
    adminSupport,
    remittance,
    complete,
    successful,
    excellent,
  } = obj;
  const query = {};
  if(pStatus !== undefined) query['projectLock.status'] = pStatus;
  if(uStatus !== undefined) query['usersMessagesLock.status'] = uStatus;
  if(usersSupport !== undefined) query['applicationStatus.usersSupport'] = usersSupport;
  if(projectPassed !== undefined) query['applicationStatus.projectPassed'] = projectPassed;
  if(usersMessagesPassed !== undefined) query['applicationStatus.usersMessagesPassed'] = usersMessagesPassed;
  if(adminSupport !== undefined) query['applicationStatus.adminSupport'] = adminSupport;
  if(remittance !== undefined) query['applicationStatus.remittance'] = remittance;
  if(complete !== undefined) query['applicationStatus.complete'] = complete;
  if(successful !== undefined) query['applicationStatus.successful'] = successful;
  if(excellent !== undefined) query['applicationStatus.excellent'] = excellent;
  return query;
};

fundApplicationFormSchema.statics.match = match;

fundApplicationFormSchema.pre('save', function(next) {
  if(!this.timeOfLastRevise) {
    this.timeOfLastRevise = this.timeToCreate;
  }
  next();
});

const FundApplicationFormModel = mongoose.model('fundApplicationForms', fundApplicationFormSchema);
module.exports = FundApplicationFormModel;
