module.exports = async (ctx, next) => {
  const {scoreChange} = ctx;
  if(scoreChange) {
    let {user, targetUser} = ctx.data;
    if(!targetUser)
      targetUser = user;
  }
};