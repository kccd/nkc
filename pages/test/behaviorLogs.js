let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/rescue', {useMongoClient: true, promiseLibrary: Promise});
mongoose.Promise = global.Promise;
let Schema = mongoose.Schema;
const {scoreMap, scoreCoefficientMap} = require('../../settings').user;

const arango = require('arangojs');
const db = arango('http://192.168.11.111');
const aql = arango.aql;

db.useDatabase('rescue');

const usersBehaviorSchema = new Schema({
  timeStamp: {
    type: String,
    default: Date.now,
    index: 1
  },
  uid: {
    type: String,
    required: true,
    index: 1,
  },
  toUid: {
    type: String,
    required: true,
    index: 1
  },
  pid: {
    type: String,
    index: 1
  },
  tid: {
    type: String,
    index: 1,
  },
  fid: {
    type: String,
    index: 1
  },
  mid: {
    type: String,
    index: 1
  },
  toMid: {
    type: String,
    index: 1
  },
  ip: {
    type: String,
    required: true,
    index: 1
  },
  port: {
    type: String,
    required: true,
    index: 1
  },
  score: {
    type: Number,
    default: 0,
  },
  isManageOp: {
    type: Boolean,
    default: false,
    index: 1
  },
  operation: {
    type: String,
    required: true,
    index: 1
  },
  type: {
    type: String,
    default: 'unclassified',
    index: 1
  },
  attrChange: {
    name: String,
    change: Number
  }
});

const UsersBehaviorModel = mongoose.model('usersBehavior', usersBehaviorSchema, 'usersBehavior');

let skip = 0;
const limit = 1000;
let length;
async function import1() {
  if(!length) {
    const c = await db.collection('usersBehavior').all();
    length = await c.count;
  }
  if(skip < length) {
    const cursor = await db.query(aql`
      for bl in usersBehavior
      sort bl.time DESC
      limit ${skip}, ${limit}
      return bl
    `);
    const bls = await cursor.all();
    try {
      await Promise.all(bls.map(async bl => {
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
        } = bl;
        console.log(type);
        switch (type) {
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
            const post2 = await db.collection('posts').document(pid);
            toUid = post2.uid;
            break;
          default:
            toUid = uid;
            type = undefined
        }
        if (!toMid)
          toMid = undefined;
        if (!mid) {
          let thread;
          try {
            thread = await db.collection('threads').document(tid);
            mid = thread.uid
          } catch (e) {
            mid = '49683'
          }
        }
        if (!fid) {
          let thread;
          try {
            thread = await db.collection('threads').document(tid);
            fid = thread.fid;
          } catch (e) {
            fid = 'recycle'
          }
        }
        const attrChange = {};
        const obj = scoreMap[type];
        if(type && obj) {
          for (const k of Object.keys(obj)) {
            if (k !== 'score') {
              attrChange.name = k;
              attrChange.change = obj[k]
            }
          }
          const newDoc = new UsersBehaviorModel({
            uid,
            fid,
            tid: tid === '0'? '': tid,
            pid,
            toUid,
            timeStamp: time,
            operation: type,
            mid,
            toMid,
            ip: '0.0.0.0',
            port: '0',
            score: scoreCoefficientMap[type],
            attrChange
          });
          try {
            await newDoc.save()
            console.log(11)
          } catch (e) {
            console.log(11111);
            console.log(attrChange);
            console.log(e)
          }}
      }));
      console.log('done');
    } catch(e) {
      console.log(e);
    }
    skip += limit;
    import1()
  } else {
    console.log('finally done!!!!!!!!!!!!')
  }
}



import1();