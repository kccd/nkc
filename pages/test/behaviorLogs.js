let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/rescue', {useMongoClient: true, promiseLibrary: Promise});
mongoose.Promise = global.Promise;
let Schema = mongoose.Schema;
const {scoreMap, scoreCoefficientMap} = require('../../settings').user;

const arango = require('arangojs');
const db = arango('http://192.168.11.15');

db.useDatabase('rescue');

const usersBehaviorSchema = new Schema({
  timeStamp: {
    type: String,
    default: Date.now
  },
  uid: {
    type: String,
    required: true
  },
  toUid: {
    type: String,
    required: true
  },
  pid: {
    type: String,
    required: true,
  },
  tid: {
    type: String,
    required: true
  },
  fid: {
    type: String,
    required: true
  },
  mid: {
    type: String,
    required: true
  },
  toMid: String,
  ip: {
    type: String,
    required: true
  },
  port: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    default: 0,
  },
  isManageOp: {
    type: Boolean,
    default: false
  },
  operation: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'unclassified'
  }
});

const UsersBehaviorModel = mongoose.model('usersBehavior', usersBehaviorSchema);
const errors = [];

async function import1() {
  console.log('qqq')
  const cursor = await db.collection('usersBehavior').all();
  const docs = await cursor.all();
  console.log(docs);
  for(const doc of docs) {
    let {
      toMid,
      time,
      type,
      uid,
      fid,
      tid,
      pid,
      mid,
    } = doc;
    switch(type) {
      case 1:
        type = 'postToForum';
        break;
      case 2:
        type = 'postToThread';
        break;
      case 3:
        type = 'postToPost';
        break;
      case 4:
        type = 'recommendPost';
        break;
      case 5:
        type = 'unrecommendPost';
        break;
      default:
        type = undefined
    }
    if(!toMid)
      toMid = undefined;
    if(!mid) {
      const thread = await db.collection('threads').document(tid);
      mid = thread.uid
    }
    const newDoc = new UsersBehaviorModel({
      uid,
      fid,
      tid,
      pid,
      timeStamp: time,
      operation: type,
      mid,
      toMid,
      ip: '0.0.0.0',
      port: '000',
      score: scoreCoefficientMap[type]
    });
    try {
      await newDoc.save()
    } catch(e) {
      e.data = doc;
      errors.push(e)
    }
  }
  return errors
}

import1().then(errors => {
  if(errors.length > 0) {
    for(const e of errors) {
      console.log(e)
    }
  }
});