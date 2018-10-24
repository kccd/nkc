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
    type: [String],
    default:["rna","pho"]
  }
},
{
  toObject: {
    getters: true,
    virtuals: true
  }
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
  const posts = await ActivityPostModel.find({acid:this.acid});
  await Promise.all(posts.map(async post => {
  	await post.extendUser();
  }));
  return this.posts = posts;
}
module.exports = mongoose.model('activity', activitySchema, 'activity');