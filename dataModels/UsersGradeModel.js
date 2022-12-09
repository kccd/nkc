const mongoose = require('mongoose');
const getRedisKeys = require("../nkcModules/getRedisKeys");
const redisClient = require("../settings/redisClient");
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

usersGradeSchema.virtual('iconUrl')
  .get(function() {
    return this._iconUrl;
  })
  .set(function(iconUrl) {
    this._iconUrl = iconUrl;
  });

usersGradeSchema.statics.getGradeList = async (blacklist = []) => {
  const GM = mongoose.model("usersGrades");
  const grades = await GM.find({_id: {$nin: blacklist}}, {_id: 1, displayName: 1}).sort({_id: 1});
  const data = [];
  for(const grade of grades) {
    data.push({
      type: `grade-${grade._id}`,
      name: `等级 - ${grade.displayName}`
    });
  }
  return data;
};

usersGradeSchema.statics.getIconUrl = async (id) => {
  const tools = require('../nkcModules/tools');
  return tools.getUrl('gradeIcon', id);
};

usersGradeSchema.statics.saveGradesToRedis = async () => {
  const getRedisKeys = require('../nkcModules/getRedisKeys');
  const redisClient = require('../settings/redisClient');
  const UsersGradeModel = mongoose.model('usersGrades');
  const grades = await UsersGradeModel.find();
  const key = getRedisKeys('grades');
  await redisClient.setAsync(key, JSON.stringify(grades));
};

usersGradeSchema.statics.getGradesFromRedis = async () => {
  const getRedisKeys = require('../nkcModules/getRedisKeys');
  const redisClient = require('../settings/redisClient');
  const key = getRedisKeys('grades');
  let grades = [];
  try{
    const _grades = await redisClient.getAsync(key);
    grades = JSON.parse(_grades) || [];
  } catch(err) {}
  return grades;
};

usersGradeSchema.statics.getGradesSortByScore = async (sort = 1) => {
  const UsersGradeModel = mongoose.model('usersGrades');
  const grades = await UsersGradeModel.getGradesFromRedis();
  sort = sort === 1? 1: -1;
  return grades.sort((a, b) => {
    return (a.score - b.score) * sort;
  });
};


const UsersGradeModel = mongoose.model('usersGrades', usersGradeSchema);
module.exports = UsersGradeModel;
