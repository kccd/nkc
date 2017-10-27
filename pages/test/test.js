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
  }
});

let a = mongoose.model('mongoose', ASchema, 'mongoose');




(async function() {
  let Obj = await a.findOneAndRemove({name: '1'});
  console.log(JSON.stringify(Obj));
  /*for (let i = 0; i < 100; i++) {
    new a({
      name: i.toString(),
      age: i
    })
      .save();
  }*/
})();
