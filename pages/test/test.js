let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/rescue', {useMongoClient: true});
mongoose.Promise = global.Promise;
let Schema = mongoose.Schema;

let a = new Schema({
  id:{
    type: Number,
    unique: true,
    index: 1,
  }
})

let A = mongoose.model('test', a);
let aa = new A({
  id: 1
})
let bb = new A({
  id: 2
})
aa.save()
.then(() => {
  return bb.save()
})
.then(()=> {
  return A.find({id: 1});
})
.then(res=> {
  console.log(res);
})
.catch(err=>{
  console.log(err);
})