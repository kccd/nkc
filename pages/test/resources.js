let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/rescue', {useMongoClient: true});
mongoose.Promise = global.Promise;
let Schema = mongoose.Schema;

db = require('arangojs')('http://192.168.11.15');
db.useDatabase('rescue');

let resourcesSchema = new Schema({
  rid: {
    type: String,
    required: true,
    index: 1,
    unique: true
  },
  ext: {
    type: String,
    default: ''
  },
  hits: {
    type: Number,
    default: 0
  },
  oname: {
    type: String,
    default: ''
  },
  path: {
    type: String,
    required: true
  },
  pid: {
    type: String,
    default: '' 
  },
  size: {
    type: Number,
    default: 0
  },
  toc: {
    type: Number,
    default: Date.now
  },
  tpath: {
    type: String,
    default: ''
  },
  uid: {
    type: String,
    required: true
  }
});

let Resource = mongoose.model('resources', resourcesSchema);


let t1 = Date.now();

console.log('开始读取数据');
return db.query(`
  for r in resources
  return r
`)

.then(cursor => cursor.all())
.then((res) => {
  for(var i = 0; i < res.length; i++){
    res[i]._id = undefined;
    res[i].rid = res[i]._key;
  }
  console.log('开始写入数据');
  let n = 0;
  let m = 0;
  let toMongo = () => {
    let data = res[n];
    let resources = new Resource(data);
    resources.save()
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
