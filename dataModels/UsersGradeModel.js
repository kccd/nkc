const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const usersGradeSchema = new Schema({
	_id: Number,
	displayName: {
		type: String,
		unique: true,
		required: true
	},
	description: {
		type: String,
		default: ''
	},
	color: {
		type: String,
		default: '#aaaaaa'
	},
	score: {
		type: Number,
		unique: true,
		required: true
	},
	operationsId: {
		type: [String],
		index: 1,
		default: []
	},
  messagePersonCountLimit: {
		type: Number,
		default: 0
	},
	messageCountLimit: {
		type: Number,
		default: 0
	},
  // 每天所能发表的回复数
  postToThreadCountLimit: {
    type: Number,
    default: 0
  },
  // 发表回复间隔分钟数
  postToThreadTimeLimit: {
    type: Number,
    default: 0
  },
  // 发表文章间隔分钟数
  postToForumTimeLimit: {
    type: Number,
    default: 0
  },
  // 每天所能发表的文章数
  postToForumCountLimit: {
    type: Number,
    default: 0
  },


  postToForum: {
    countLimit: {
      unlimited: {
        type: Boolean,
        default: true
      },
      num: {
        type: Number,
        default: 0
      }
    },
    timeLimit: {
      unlimited: {
        type: Boolean,
        default: true
      },
      num: {
        type: Number,
        default: 0
      }
    }
  },
  postToThread: {
    countLimit: {
      unlimited: {
        type: Boolean,
        default: true
      },
      num: {
        type: Number,
        default: 0
      }
    },
    timeLimit: {
      unlimited: {
        type: Boolean,
        default: true
      },
      num: {
        type: Number,
        default: 0
      }
    }
  }

}, {
	collection: 'usersGrades',
  toObject: {
    getters: true,
    virtuals: true
  }
});

const UsersGradeModel = mongoose.model('usersGrades', usersGradeSchema);
module.exports = UsersGradeModel;