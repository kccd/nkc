let db = require('../dataModels');
let fn = {};
fn.addCertToUser = async (uid, cert) => {
  await db.UserModel.updateOne({uid: uid},{$addToSet:{certs: cert}});
};
fn.forumList = async () => {
  let list = [];
  let parentForums = await db.ForumModel.find({parentId: ''}).sort({order: 1});
  for (let i = 0; i <  parentForums.length; i++) {
    list[i] = {};
    list[i].parentForum = parentForums[i];
    list[i].forumGroup = await db.ForumModel.find({parentId: parentForums[i].fid}).sort({order: 1});
  }
  return list;
};
fn.sha256HMAC = (password,salt) => {
  const crypto = require('crypto');
  let hmac = crypto.createHmac('sha256',salt);
  hmac.update(password);
  return hmac.digest('hex')
};
fn.testPassword = (input,hashtype,storedPassword) => {
  let pass = '';
  let hash = '';
  let salt = '';
  let hashed = '';
  switch (hashtype) {
    case 'pw9':
      pass = input
      hash = storedPassword.hash
      salt = storedPassword.salt

      hashed = md5(md5(pass)+salt)
      if(hashed!==hash){
        return false;
      }
      break;

    case 'sha256HMAC':
      pass = input
      hash = storedPassword.hash
      salt = storedPassword.salt

      hashed = fn.sha256HMAC(pass,salt)
      if(hashed!==hash){
        return false;
      }
      break;

    default:
      if(input !== storedPassword){ //fallback to plain
        return false;
      }
  }
  return true;
};
fn.newPasswordObject = (plain) => {
  let salt = Math.floor((Math.random()*65536)).toString(16)
  let hash = fn.sha256HMAC(plain,salt)
  let pwobj = {
    hashtype:'sha256HMAC',
    password:{
      hash:hash,
      salt:salt,
    },
  };
  return pwobj
};
module.exports = fn;