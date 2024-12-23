const router = require('koa-router')();
const {
  blacklistCheckerService,
} = require('../../../services/blacklist/blacklistChecker.service');
const { OnlyUser } = require('../../../middlewares/permission');
router.post('/', OnlyUser(), async (ctx, next) => {
  const { body, internalData, data, db, state, nkcModules } = ctx;
  const lock = await nkcModules.redLock.redLock.lock('momentVote', 6000);
  try {
    const { moment } = internalData;
    const { voteType, cancel } = body;
    await blacklistCheckerService.checkInteractPermission(
      state.uid,
      moment.uid,
    );
    await db.PostsVoteModel.checkVoteType(voteType);
    const { voteUp, voteDown } = await moment.vote(voteType, state.uid, cancel);
    data.vote = {
      voteUp,
      voteDown,
    };
    await lock.unlock();
  } catch (err) {
    await lock.unlock();
    throw err;
  }
  await next();
});
module.exports = router;
