const router = require('koa-router')();
const {
  userMemoService,
} = require('../../../../services/user/userMemo.service');
const { OnlyUser } = require('../../../../middlewares/permission');
router
  .get('/memo', OnlyUser(), async (ctx, next) => {
    const { state, query } = ctx;
    const { uid } = query;
    const memo = await userMemoService.getUserMemo({
      uid: state.uid,
      tUid: uid,
    });
    ctx.apiData = {
      memo,
    };
    await next();
  })
  .put('/memo', OnlyUser(), async (ctx, next) => {
    const { body, state } = ctx;
    const { uid, nickname = '', desc = '' } = body;
    await userMemoService.checkNicknameFormat(nickname);
    await userMemoService.checkDescFormat(desc);
    await userMemoService.setUserMemo({
      uid: state.uid,
      tUid: uid,
      nickname,
      desc,
    });
    await next();
  });

module.exports = router;
