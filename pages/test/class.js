let userModule = require('./userModule');
class user{
  constructor(uid){
    if(!uid){
      return {};
    }
    return userModule.load(uid)
    .then(res => {
      return res;
    })
  }
  async load(uid){
    let a = await userModule.load(uid);
    return a;
  }
}
let a = new user('73327')
a.then(res => {
  console.log(a);  
})
