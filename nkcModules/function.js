let db = require('../dataModels');
let fn = {};
fn.addCertToUser = async (uid, cert) => {
  await db.UserModel.updateOne({uid: uid},{$push:{cert: cert}});
};
module.exports = fn;