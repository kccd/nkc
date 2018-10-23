const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const friendSchema = new Schema({

  _id: Number,

  uid: {
    type: String,
    index: 1,
    required: true
  },
  tUid: {
    type: String,
    index: 1,
    required: true
  },
  toc: {
    type: Date,
    index: 1,
    default: Date.now
  },
  tlm: {
    type: Date,
    index: 1
  },
  cid: {
    type: Number,
    index: 1,
    default: null
  },
  info: {
    name: {
      type: String,
      default: ''
    },
    phone: {
      type: [String],
      default: ['']
    },
    location: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    image: {
      type: Boolean,
      default: false
    }
  }
}, {
  collection: 'friends',
  toObject: {
    getters: true,
    virtuals: true
  }
});

friendSchema.virtual('targetUser')
  .get(function() {
    return this._targetUser;
  })
  .set(function(targetUser) {
    this._targetUser = targetUser;
  });

friendSchema.pre('save', function(next) {
  if(!this.tlm) this.tlm = this.toc;
  next();
});

const FriendModel = mongoose.model('friends', friendSchema);

module.exports = FriendModel;