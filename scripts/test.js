const {UserModel} = require('../dataModels');
(async () => {
  const user = await UserModel.findOne({uid: "74185"});
  const a = await user.extendUserPersonal();
  console.log(a);
  const b = await UserModel.getUserSubscribe(user.uid);
  console.log(b);
})();