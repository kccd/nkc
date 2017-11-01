let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test', {useMongoClient: true});
mongoose.Promise = global.Promise;
let Schema = mongoose.Schema;

let ASchema = new Schema({
  name:{
    type: String
  },
  age: {
    type: Number
  },
  time: {
    type:Date,
    default: Date.now
  }
});
ASchema.methods.getTime = function(){
  let time = this.time;
  let newTime = new Date(time);
  return newTime.getTime();
}


let a = mongoose.model('mongoose', ASchema, 'mongoose');




(async function() {
  await a.replaceOne({name: '1'}, {$set: {time: new Date()}})
  /*let Obj = await a.findOneAndRemove({name: '1'});
  console.log(JSON.stringify(Obj));*/
  /*for (let i = 0; i < 100; i++) {
    new a({
      name: i.toString(),
      age: i
    })
      .save();
  }*/
  let aaa = await a.findOne({name: "1"});
  //let time = aaa.getTime();
  console.log(aaa.time);
  console.log(new Date(new Date(aaa.time).getTime()))
})();
