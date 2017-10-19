let db = require('../dataModels');
let fn = {};
fn.addCertToUser = async (uid, cert) => {
  await db.UserModel.updateOne({uid: uid},{$addToSet:{certs: cert}});
};
module.exports = fn;