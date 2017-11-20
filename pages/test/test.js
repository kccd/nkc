let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test', {useMongoClient: true});
mongoose.Promise = global.Promise;
let Schema = mongoose.Schema;

db = require('arangojs')('http://192.168.11.7');
db.useDatabase('rescue');

let testSchema = new Schema({
  id: {
    type: 'String',
  },
  other: {
    type: 'String',
    default: 'test'
  }
});

let TestModel = mongoose.model('aaa', testSchema, 'aaa');

(async function(){
  for (let i = 0; i < 100; i++){
    await (new TestModel({id: i})).save();
    console.log(i);
  }
})();