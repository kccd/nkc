module.exports = async (ctx) => {
  const { data } = ctx;
  return ctx.redirect(`/u/${data.targetUser.uid}/profile/subscribe/forum`);
};
