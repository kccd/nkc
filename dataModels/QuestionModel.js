const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const schema = new Schema({
  _id: Number,
  disabled: {
    type: Boolean,
    default: false,
    index: 1
  },
  auth: {
    type: Boolean,
    default: null,
    index: 1
  },
  uid: {
    type: String,
    required: true,
    index: 1
  },
  cid: {
    type: Number,
    required: true,
    index: 1
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  tlm: {
    type: Date,
    default: Date.now,
    index: 1
  },
  uidLm: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    required: true,
    index: 1
  },
  content: {
    type: String,
    required: true
  },
  answer: {
    type: [String],
    required: true
  },
  hasImage: {
    type: Boolean,
    default: false
  },
  volume: {
    type: String,
    required: true,
    index: 1
  }
}, {
  collection: 'questions'
});

schema.statics.extendQuestions = async (questions) => {
  const UserModel = mongoose.model('users');
  const uid = new Set(), userObj = {};
  for(const q of questions) {
    uid.add(q.uid);
  }
  const users = await UserModel.find({uid: {$in: [...uid]}});
  users.map(u => {
    userObj[u.uid] = u;
  });
  return Promise.all(questions.map(q => {
    q_ = q.toObject();
    q_.user = userObj[q_.uid];
    return q_;
  }));
};

module.exports = mongoose.model('questions', schema);



/*

const questionSchema = new Schema({
  qid:{
    type: String,
    unique: true,
    required: true
  },
  tlm: {
    type: Date,
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  category: {
    type: String,
    required: true,
    index: 1
  },
  type: {
    type: String,
    required: true
  },
  uid: {
    type: String,
    required: true,
    index: 1
  },
  question: {
    type: String,
    required: true
  },
  answer: {
    type: [String],
    required: true
  }
},
{toObject: {
  getters: true,
  virtuals: true
}});

questionSchema.virtual('user')
  .get(function() {
    return this._user;
  })
  .set(function(u) {
    this._user = u;
  });

questionSchema.pre('save', function(next){
  try {
    if (!this.tlm) {
      this.tlm = this.toc;
    }
    return next()
  } catch(e) {
    return next(e)
  }
});


questionSchema.methods.extendUser = async function () {
  const UserModel = require('./UserModel');
  const user = await UserModel.findOnly({uid: this.uid});
  return this.user = user;
};


module.exports = mongoose.model('questions', questionSchema);*/
