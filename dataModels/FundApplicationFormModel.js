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
  postpone: {
    type: [Number],
    default: []
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
      required: true
    },
    aim: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    supplementary: {
      type: [String],
      default: []
    }
  },
  reviseCount: {
    type: Number,
    required: true
  },
  applicationStatus: {
    usersSupport: {
      type: Boolean,
      default: false
    },
    projectPassed: {
      type:Boolean,
      default: false
    },
    usersMessagesPassed: {
      type: Boolean,
      default: false
    },
    remittance: {
      type: Boolean,
      default: false
    },
    complete: {
      type: Boolean,
      default: false
    },
    successful: {
      type: Boolean,
      default: false
    },
    excellent: {
      type: Boolean,
      default: false
    }
  },
  projectLock: {
    status: {
      submitted: {
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
      }
    },
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
  usersMessagesLock: {
    status: {
      submitted: {
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
      }
    },
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
  supporter: {
    type: [String],
    default: []
  },
  objector: {
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
  },
  comments: {
    type: [String],
    default: []
  }
}, {
  collection: 'fundApplicationForms'
});

const FundApplicationFormModel = mongoose.model('fundApplicationForms', fundApplicationFormSchema);
module.exports = FundApplicationFormModel;