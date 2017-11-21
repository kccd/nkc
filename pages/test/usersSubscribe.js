let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/rescue', {useMongoClient: true});
mongoose.Promise = global.Promise;
let Schema = mongoose.Schema;

db = require('arangojs')('http://192.168.11.7');
db.useDatabase('rescue');

let usersSubscribeSchema = new Schema({
	uid: {
		type: String,
		unique: true,
    required: true
	},
	subscribeForums: {
		type: [String],
		default: []
	},
	subscribeUsers: {
		type: [String],
		default: []
	},
	subscribers: {
		type: [String],
		default: []
	}
});

let UsersSubscribe = mongoose.model('usersSubscribe', usersSubscribeSchema, 'usersSubscribe');



let t1 = Date.now();

console.log('开始读取数据');
return db.query(`
  for u in usersSubscribe
  return u
`)

.then(cursor => cursor.all())
.then((res) => {
  console.log('users.focus_forums > usersSubscribe.subscribeForums')
  let sub = async () =>{
    for(let i in res) {
      console.log(i);
      let str;
      try {
        str = await db.collection('users').document(res[i]._key);
        if(str.focus_forums) {
          res[i].subscribeForums = str.focus_forums.split(',');
        }
      } catch(e) {
        console.log(res[i]._key);
        res.splice(i, 1)
      }
    }
    return res;
  };
  return sub();
})
.then((res) => {
  for(var i = 0; i < res.length; i++){
    res[i]._id = undefined;
    res[i].uid = res[i]._key;
  }
  console.log('开始写入数据');
  let n = 0;
  let m = 0;
  let toMongo = () => {
    let data = res[n];
    let usersSubscribe = new UsersSubscribe(data);
    usersSubscribe.save()
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
