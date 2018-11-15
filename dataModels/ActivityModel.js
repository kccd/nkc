const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const activitySchema = new Schema({
  acid: {
    type: String,
    unique: true,
    required: true
  },
  activityTitle: {
    type: String,
    default: null
  },
  enrollStartTime: {
    type: String,
    default: null
  },
  enrollEndTime: {
    type: String,
    default: null
  },
  holdStartTime: {
    type: String,
    default: null
  },
  holdEndTime: {
    type: String,
    default: null
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  uid: {
    type: String,
    required: true
  },
  address: {
    type: String,
    default:null
  },
  limitNum: {
    type: Number,
    default: 0
  },
  signUser: {
    type: [String],
    default: []
  },
  description: {
    type: String,
    default: null
  },
  sponsor: {
    type: String,
    default: null
  },
  auditStatus: {
    type: String,
    default: "ing"
  },
  activityType: {
    type: String,
    default: "draft"
  },
  posterId: {
    type: String,
    default: null
  },
  contactNum: {
    type: String,
    default: null
  },
  continueTofull: {
    type: Boolean,
    default: false
  },
  conditions: {
    type: [Schema.Types.Mixed],
    default: []
  }
},
{
  toObject: {
    getters: true,
    virtuals: true
  }
});


activitySchema.virtual('posts')
.get(function() {
  return this._post;
})
.set(function(post) {
  this._post = post;
});

activitySchema.virtual('user')
.get(function() {
  return this._user;
})
.set(function(user) {
  this._user = user;
});

activitySchema.virtual('historys')
.get(function() {
  return this._historys;
})
.set(function(historys) {
  this._historys = historys;
});

activitySchema.virtual('userPersonal')
.get(function() {
  return this._userPersonal;
})
.set(function(userPersonal) {
  this._userPersonal = userPersonal;
});

activitySchema.methods.extendUser = async function() {
  const UserModel = mongoose.model('users');
  const user = await UserModel.findOnly({uid: this.uid});
  return this.user = user;
};

activitySchema.methods.extendUserPersonal = async function() {
  const UserModel = mongoose.model('usersPersonal');
  const userPersonal = await UserModel.findOnly({uid: this.uid});
  return this.userPersonal = userPersonal;
};

activitySchema.methods.extendPost = async function() {
  const ActivityPostModel = mongoose.model('activityPost');
  let posts = await ActivityPostModel.find({acid:this.acid});
  await Promise.all(posts.map(async post => {
    await post.extendUser();
    post = post.toObject();
    return post;
  }));
  return this.posts = posts;
}

activitySchema.methods.extendHistorys = async function() {
  const ActivityHistoryModel = mongoose.model('activityHistory');
  let historys = await ActivityHistoryModel.find({acid: this.acid}).sort({toc:-1}).skip(1);
  return historys = historys;
}
module.exports = mongoose.model('activity', activitySchema, 'activity');