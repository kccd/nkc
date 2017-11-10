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
  const cursor = await db.collection('usersBehavior').all();
  const docs = await cursor.all();
  for(const doc of docs) {
    let toUid;
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
        toUid = uid;
        break;
      case 2:
        type = 'postToThread';
        toUid = uid;
        break;
      case 3:
        type = 'postToPost';
        toUid = uid;
        break;
      case 4:
        type = 'recommendPost';
        const post = await db.collection('posts').document(pid);
        toUid = post.uid;
        break;
      case 5:
        type = 'unrecommendPost';
        const a1 = await db.collection('posts').document(pid);
        toUid = a1.uid;
        break;
      default:
        toUid = uid;
        type = undefined
    }
    if(!toMid)
      toMid = undefined;
    if(!mid) {
      let thread;
      try {
        thread = await db.collection('threads').document(tid);
        mid = thread.uid
      } catch(e) {
        console.log(tid)
        mid = '0'
      }
    }
    if(!fid) {
      let thread;
      try {
        thread = await db.collection('threads').document(tid);
        fid = thread.fid;
      } catch(e) {
        console.log(thread);
        fid = 'hw'
      }
    }
    const newDoc = new UsersBehaviorModel({
      uid,
      fid,
      tid,
      pid,
      toUid,
      timeStamp: time,
      operation: type,
      mid,
      toMid,
      ip: '0.0.0.0',
      port: '0',
      score: scoreCoefficientMap[type]
    });
    try {
      await newDoc.save()
    } catch(e) {
      console.log(fid);
      console.log(e)
    }
  }
  console.log('save 1');
  return errors
}

import1().then(errors => {
  if(errors.length > 0) {
    for(const e of errors) {
      console.log(e)
    }
  }
});