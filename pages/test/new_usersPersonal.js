const {UsersPersonalModel} = require('../../dataModels');
const db = require('./arangodb');
const begin = require('./begin');
const apiFn = require('../../nkcModules/apiFunction');
const t = Date.now();

const init = async () => {
  console.log('转移电话...');
  await db.query(`
    for m in mobilecodes
    filter m.uid
    let u = document(users_personal, m.uid)
    update u with{mobile: m.mobile} in users_personal
  `);
  console.log('转移注册ip...');
  await db.query(`
    for u in users
    filter u.regIP
    let up = document(users_personal, u._key)
    filter up
    update up with{regip: u.regIP, regPort: u.regPort} in users_personal
  `);
  let total = await db.query(`
    for u in users_personal
    filter document(users, u._key)
    collect with count into length
    return length
  `);
  return await total.all();
};

const moveData = async (total,begin, count) => {
  let t1 = Date.now();
  console.log(`开始读取数据（${begin} - ${begin + count}）`);
  let data = await db.query(`
    for u in users_personal
    filter document(users, u._key)
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
    d.hashType = d.hashtype;
    if(typeof d.password === 'string') {
      const passwordObj = apiFn.newPasswordObject(d.password);
      const {hashType, password} = passwordObj;
      d.hashType = hashType;
      d.password = password;
    }
    if(typeof d.password === 'object' && d.password.hash === '' || d.password.salt === '') {
      const pw = `00000000q`;
      const passwordObj = apiFn.newPasswordObject(pw);
      const {hashType, password} = passwordObj;
      d.hashType = hashType;
      d.password = password;
    }
    if(d.new_message.replies === null) d.new_message.replies = 0;
    d.newMessage = d.new_message;
    d.regIP = d.regip;
    if(d.email && !d.email.includes('@')) d.email = undefined;
    const newUser = new UsersPersonalModel(d);
    try{
      await newUser.save();
      console.log(`总数：${total}, 第${begin+n}条数据写入成功！当前${count}条耗时：${Date.now() - t1}ms， 累计耗时：${Date.now() - t}ms`);
    }catch(e) {
      return {e, d};
    }
  }
};

begin(init, moveData);