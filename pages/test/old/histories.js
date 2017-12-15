let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/rescue', {useMongoClient: true});
mongoose.Promise = global.Promise;
let Schema = mongoose.Schema;

db = require('arangojs')('http://192.168.11.111');
db.useDatabase('rescue');

let historiesSchema = new Schema({
  atUsers: {
    type: Array,
    default: []
  },
  t: {
    type: String,
    default: ''
  },
  c: {
    type: String,
    required: true
  },
  credits: {
    type: Array,
    default: []
  },
  disabled: {
    type: Boolean,
    default: false
  },
  ipoc: {
    type: String,
    default: '0.0.0.0'
  },
  iplm: {
    type: String,
  },
  r: {
    type: Array,
    default: []
  },
  tid: {
    type: String,
    required: true
  },
  tlm: {
    type: Date
  },
  toc: {
    type: Date,
    default: Date.now
  },
  uid: {
    type: String,
    required: true
  },
  uidlm: {
    type: String
  },
  l: {
    type: String,
    default: ''
  },
  pid: {
    type: String,
    required: true,
    index: 1
  }
});

historiesSchema.pre('save', function(next) {
  if(!this.iplm){
    this.iplm = this.ipoc;
  }
  if(!this.uidlm){
    this.uidlm = this.uid;
  }
  if(!this.tlm) {
    this.tlm = this.toc
  }
  next();
});

let Histories = mongoose.model('histories', historiesSchema);


let t1 = Date.now();
console.log('开始读取数据');
db.query(`
    for h in histories
    return h
`)
.then(cursor => cursor.all())
.then((res) => {
  for(var i = 0; i < res.length; i++){
    res[i]._id = undefined;
  }
  console.log('开始写入数据');
  let n = 0;
  let toMongo = () => {
    let data = res[n];
    let histories = new Histories(data);
    histories.save()
    .then(() => {
      n++;
      console.log(n);
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
      console.log(`存数据出错:${err}`)
    });
  }
  toMongo();
}) 
.catch((err) => {
  console.log(err);
})
