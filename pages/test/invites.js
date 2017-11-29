let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/rescue', {useMongoClient: true});
mongoose.Promise = global.Promise;
let Schema = mongoose.Schema;

db = require('arangojs')('http://192.168.11.23');
db.useDatabase('rescue');

let invitesSchema = new Schema({
  toc: {
    type: Number,
    default: Date.now(),
    index: 1
  },
  pid: {
    type: String,
    required: true,
    index: 1 
  },
  invitee: {
    type: String,
    required: true,
    index: 1
  },
  inviter: {
    type: String,
    required: true,
    index: 1
  }
});

let Invites = mongoose.model('invites', invitesSchema);
console.log('开始读取数据');
let t1 = Date.now();
db.query(`
  for i in invites
  filter i.inviter && i.invitee
  return i
`)
.then(curtor => curtor.all())
.then((res) => {
  console.log('数据读取完成，开始写入数据');
  let n = 0;
  let toMongo = () => {
    let data = res[n];
    let invites = new Invites({
      toc: data.toc,
      pid: data.pid,
      invitee: data.invitee,
      inviter: data.inviter
    });
    invites.save()
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