let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/rescue', {useMongoClient: true});
mongoose.Promise = global.Promise;
let Schema = mongoose.Schema;

db = require('arangojs')('http://192.168.11.23');
db.useDatabase('rescue');
let threadTypesSchema = new Schema({
  cid: {
    type: Number,
    required: true
  },
  order: {
    type: Number,
  },
  fid: {
    type: String,
    required: true,
    index: 1
  },
  name: {
    type: String,
    required: true
  }
});

let findMaxNumber = async (fid) => {
  let threadType = await ThreadTypes.findOne({fid: fid}).sort({order: -1});
  if(!threadType || (!threadType.order && threadType.order !== 0)) return -1;
  return threadType.order;
};

threadTypesSchema.pre('save',async function(next){
  if(!this.order && this.order !== 0) {
    let number = await findMaxNumber(this.fid);
    this.order = number + 1;
    console.log(this.order);
  }
  await next();
});
let ThreadTypes= mongoose.model('threadTypes', threadTypesSchema, 'threadTypes');


let t1 = Date.now();

console.log('开始读取数据');
return db.query(`
  for s in threadtypes
  return s
`)

  .then(cursor => cursor.all())
  .then((res) => {
    for(var i = 0; i < res.length; i++){
      res[i]._id = undefined;
      res[i].cid = res[i]._key;
    }
    console.log('开始写入数据');
    let n = 0;
    let m = 0;
    let toMongo = () => {
      let data = res[n];
      let threadTypes = new ThreadTypes(data);
      threadTypes.save()
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
