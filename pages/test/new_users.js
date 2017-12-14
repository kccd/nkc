const {UserModel} = require('../../dataModels');
const db = require('./arangodb');
const begin = require('./begin');

const t = Date.now();

const init = async () => {
  await db.query(`
    for u in users
    filter u._key == "74190" || u._key == "74191"
    remove u in users
  `);
  let total = await db.query(`
    for u in users
    collect with count into length
    return length
  `);
  return await total.all();

};

const moveData = async (total,begin, count) => {
  let t1 = Date.now();
  console.log(`开始读取数据（${begin} - ${begin + count}）`);
  let data = await db.query(`
    for u in users
    limit ${begin}, ${count}
    return u
  `);
  data = await data.all();
  console.log('开始写入...');
  let n = 0;
  for (let d of data) {
    n++;
    d._id = undefined;
    d.uid = d._key;
    if(d.score === null) d.score = 0;
    if(d.username.length > 30) d.username = d.username.slice(0, 30);
    d.usernameLowerCase = d.username.toLowerCase();
    d.postSign = d.post_sign;
    d.certs = d.certs || [];
    const index = d.certs.indexOf('mail');
    if(index !== -1) {
      d.certs.splice(index, 1, 'email');
    }
    const newUser = new UserModel(d);
    try{
      await newUser.save();
      console.log(`总数：${total}, 第${begin+n}条数据写入成功！当前${count}条耗时：${Date.now() - t1}ms， 累计耗时：${Date.now() - t}ms`);
    }catch(e) {
      return {e, d};
    }
  }
};

begin(init, moveData);