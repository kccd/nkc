const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const {data, db, state} = ctx;
    data.teams = await db.PIMTeamModel.getTeamsByUserId(state.uid);
    await next();
  })
  .post('/', async (ctx, next) => {
    const {body, db, state, data} = ctx;
    const {name, description} = body.team;
    await db.PIMTeamModel.checkTeamInfo({
      name, description
    });
    const team = db.PIMTeamModel({
      _id: await db.SettingModel.operateSystemID('PIMTeams', 1),
      uid: state.uid,
      name,
      description,
      membersId: [state.uid]
    });
    await team.save();
    data.team = team;
    await next();
  });
module.exports = router;