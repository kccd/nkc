let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/rescue', {useMongoClient: true});
mongoose.Promise = global.Promise;
let Schema = mongoose.Schema;

db = require('arangojs')();
db.useDatabase('rescue');


const threadSchema = new Schema({
  tid: {
    type: String,
    unique: true,
    required:true
  },
  category: {
    type: String,
    default: ''
  },
  cid: {
    type: String,
    default:''
  },
  count: {
    type: Number,
    default: 0
  },
  countRemain: {
    type: Number,
    default: 0
  },
  countToday: {
    type: Number,
    default: 0
  },
  digest: {
    type: Boolean,
    default: false
  },
  digestInMid: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  esi: {
    type: Boolean,
    default: false
  },
  fid: {
    type: String,
    required: true
  },
  hasFile: {
    type: Boolean,
    default: false
  },
  hasImage: {
    type: Boolean,
    default: false
  },
  hideInMid: {
    type: Boolean,
    default: false
  },
  hits: {
    type: Number,
    default: 0
  },
  lm: {
    type: String,
    default: ''
  },
  mid: {
    type: String,
    required: true
  },
  oc: {
    type: String,
    default: ''
  },
  tlm: {
    type: Number,
  },
  toc: {
    type: Number,
    default: Date.now
  },
  toMid: {
    type: String,
    default: ''
  },
  topped: {
    type: Boolean,
    default:false
  },
  toppedUsers: {
    type: [String],
    default: []
  },
  uid: {
    type: String,
    required: true
  }
});
threadSchema.pre('save', function (next) {
  if(!this.tlm) {
    this.tlm = this.toc;
  }
  next();
});
let Thread = mongoose.model('threads', threadSchema);


let t1 = Date.now();

console.log('开始读取数据');
return db.query(`
  for s in threads
  return s
`)

.then(cursor => cursor.all())
.then((res) => {
  for(var i = 0; i < res.length; i++){
    res[i]._id = undefined;
    res[i].tid = res[i]._key;
  }
  console.log('开始写入数据');
  let n = 0;
  let m = 0;
  let toMongo = () => {
    let data = res[n];
    let thread = new Thread(data);
    thread.save()
    .then(() => {
      if(m+1000 == n){
        m = n;
        console.log(n);
      }
      n++;
      if(n >= res.length) {
        let t2 = Date.now();
        console.log(`${res.length}条数据写入完成，耗时：${t2-t1}ms`);
        return;
      }else{
        toMongo();
        return;
      }
    })
    .catch((err) => {
      console.log(data);
      console.log(`存数据出错:${err}`)
    });
  }
  toMongo();
}) 
.catch((err) => {
  console.log(err);
})
