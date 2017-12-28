const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const fundSchema = new Schema({
  _id: Number,
  timeToCreate: {
    type: Date,
    default: Date.now,
    index: 1 
  },
  timeOfLastRevise: {
    type: Date,
    index: 1
  },
  name: {
    type: String,
    default: '科创基金',
    index: 1
  },
  money: {
    type: Number,
    required: true,
    index: 1
  },
  color: {
    type: String,
    default: '#7f9eb2'
  },
  description: {
    type: String,
    default: ''
  },
  display: {
    type: Boolean,
    default: true
  },
  censor: {
    userLevel: {
      type: Number,
      default: 0,
      index: 1
    },
    userCount: {
      type: Number,
      default: 0,
      index: 1
    },
    certs: {
      type: [String],
      default: []
    }
  },
  preconditions: {
    userLevel: {
      type: Number,
      default: 0
    },
    postCount: {
      type: Number,
      default: 0
    },
    threadCount: {
      type: Number,
      default: 0
    },
    timeToRegister: {
      type: Number,
      default: 0
    },
    supportCount: {
      type: Number,
      default: 0
    },
    attachments: {
      threadCount: {
        type: Number,
        default: 0
      },
      paper: {
        passed: {
          type: Boolean,
          default: false
        },
        count: {
          type: Number,
          default: 0
        }
      }
    },
    authentication: {
      idCard: {
        type: Boolean,
        default: false
      },
      lifePhoto: {
        type: Boolean,
        default: false
      },
      idCardPhoto: {
        type: Boolean,
        default: false
      },
      handheldIdCardPhoto: {
        type: Boolean,
        default: false
      }
    }
  },
  timeOfPublicity: {
    type: Number,
    default: 0
  },
  reviseCount: {
    type: Number,
    default: 0
  },
}, {
	toObject: {
		getters: true,
		virtuals: true
	}
});


fundSchema.pre('save', function(next){
  if(!this.timeOfLastRevise) this.timeOfLastRevise = this.timeToCreate;
  next();
});

fundSchema.methods.ensurePermission = function(user) {
	const {preconditions} = this;
	const {userLevel, postCount, threadCount, timeToRegister} = preconditions;
	// if(user.userLevel < userLevel) throw '账号等级未满足条件';
	if(user.postCount < postCount) throw '回帖量未满足条件';
	if(user.threadCount < threadCount) throw '发帖量未满足条件';
	if(user.toc > Date.now() - timeToRegister*24*60*60*1000) throw '注册时间未满足条件';
};


const FundModel = mongoose.model('funds', fundSchema);
module.exports = FundModel;