let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/rescue', {useMongoClient: true});
mongoose.Promise = global.Promise;
let Schema = mongoose.Schema;

db = require('arangojs')('http://192.168.11.15');

db.useDatabase('rescue');

let behaviorLogsSchema = new Schema({
  isManageOp: {
    type: Boolean,
    required: true,
    index: 1
  },
  timeStamp: {
    type: Number,
    default: Date.now,
    index: 1
  },
  port: {
    type: Number,
    default: '0000'
  },
  address: {
    type: String,
    default: '0.0.0.0'
  },
  scoreChange: {
    type: Number,
    default: 0
  },
  from: {
    type: String,
    required: true,
    index: 1
  },
  to: {
    type: String,
    required: true,
    index: 1
  },
  operation: {
    type: String,
    required: true
  },
  attrChange: {
    change: {
      type: Number,
      default: 0
    },
    name: {
      type: String,
      default: ''
    }
  },
  parameters: {
    targetKey: {
      type: String,
      require: true
    }
  }
});

let BehaviorLog = mongoose.model('behaviorLogs', behaviorLogsSchema);

console.log('开始读取数据');
let t1 = Date.now();
db.query(`
  for b in behaviorLogs
  return b
`)
.then(curtor => curtor.all())
.then((res) => {
  console.log('数据读取完成，开始写入数据');
  let n = 0;
  let toMongo = () => {
    let data = res[n];
    data.attrChange = data.attrChange?data.attrChange:{};
    let behaviorLog = new BehaviorLog({
      isManageOp: data.isManageOp,
      timeStamp: data.timeStamp,
      from: data.from,
      to:data.to,
      scoreChange: data.scoreChange,
      operation: data.operation,
      port: data.port,
      address: data.address,
      attrChange:{
        change: data.attrChange.change,
        name: data.attrChange.name
      },
      parameters: {
        targetKey: data.parameters.targetKey
      }
    });
    behaviorLog.save()
    .then(() => {
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
      console.log(`存数据出错:${err}`)
    });
  }
  toMongo();
})

/* let a = new BehaviorLog({
  isManageOp: true,
  from: '73327',
  to: '73327',
  operation: 'viewHome',
  attrChange:{
    name: 'threadCount'
  },
  parameters: {
    targetKey: 'm/73327'
  }
});

console.log(a); */