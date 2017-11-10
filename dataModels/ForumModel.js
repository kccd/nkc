const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const {getQueryObj} = require('../nkcModules/apiFunction');

const forumSchema = new Schema({
	abbr: {
    type: String,
    default: ''
  },
  class: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: 'grey'
  },
  countPosts: {
    type: Number,
    default: 0
  },
  countThreads: {
    type: Number,
    default: 0
  },
  countPostsToday: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    required: ''
  },
  displayName: {
    type: String,
    required: true,
  },
  iconFileName: {
    type: String,
    default: ''
  },
  isVisibleForNCC: {
    type: Boolean,
    default: false
  },
  moderators: {
    type: Array,
    default: []
  },
  order: {
    type: Number,
    default: 0
  },
  parentId: {
    type: String,
    default: ''
  },
  fid: {
    type: String,
    unique: true,
    required: true
  },
  tCount: {
    digest: {
      type: Number,
      default: 0
    },
    normal: {
      type: Number,
      default: 0
    }
  },
  type: {
    type: String,
    required: true,
    index: 1
  },
  visibility: {
    type: Boolean,
    default: false
  }
});

forumSchema.methods.getThreadsByQuery = async function(query) {
  const {$match, $sort, $skip, $limit} = getQueryObj(query);
  const fid = this.fid;
  let childFid = [];
  if(this.type === 'category') {
    let fidArr = await mongoose.connection.db.collection('forums').find({parentId: fid}, {_id: 0, fid: 1}).toArray();
    for (let i of fidArr) {
      childFid.push(i.fid);
    }
  } else {
    childFid.push(this.fid);
  }
  console.log($match)
  return mongoose.connection.db.collection('threads').aggregate([
    {$match: {fid: {$in: childFid}}},
    {$match},
    {$sort},
    {$skip},
    {$limit},
    {$lookup: {
      from: 'posts',
      localField: 'oc',
      foreignField: 'pid',
      as: 'oc'
    }},
    {$unwind: "$oc"},
    {$lookup: {
      from: 'posts',
      localField: 'lm',
      foreignField: 'pid',
      as: 'lm'
    }},
    {$unwind: "$lm"},
    {$lookup: {
      from: 'users',
      localField: 'uid',
      foreignField: 'uid',
      as: 'user'
    }},
    {$unwind: '$user'},
    {$lookup: {
      from: 'users',
      localField: 'oc.uid',
      foreignField: 'uid',
      as: 'oc.user'
    }},
    {$unwind: '$oc.user'},
    {$lookup: {
      from: 'users',
      localField: 'lm.uid',
      foreignField: 'uid',
      as: 'lm.user'
    }},
    {$unwind: '$lm.user'}
  ]).toArray()
};

module.exports = mongoose.model('forums', forumSchema);