module.exports = async (ctx, next) => {
  const {port, address: ip, settings} = ctx;
  const {UsersBehaviorModel} = ctx.db;
  const {scoreMap} = settings.user;
  ctx.generateUsersBehavior = async function(obj) {
    let {user, targetUser} = ctx.data;
    if(!targetUser)
      targetUser = user;
    const attributeChange = scoreMap[obj.operation];
    const userAttrChangeKey = Object.keys(attributeChange)
      .filter(key => key !== 'score')[0];
    const userAttrChangeValue = attributeChange[userAttrChangeKey];
    targetUser[userAttrChangeKey] = targetUser[userAttrChangeKey] + userAttrChangeValue;
    targetUser.score = targetUser.score + attributeChange.score;
	  await targetUser.save();
    const attrChange = {name: userAttrChangeKey, change: userAttrChangeValue};
    const score = attributeChange.score;
    const uid = user.uid;
    const toUid = targetUser.uid;
    const behavior = Object.assign(obj, {attrChange, port, ip, score, uid, toUid});
    await new UsersBehaviorModel(behavior).save();
    const attr = targetUser[attrChange.name];
    targetUser[attrChange.name] = attr + attrChange.change;
    await targetUser.save()
  };
  await next()
};