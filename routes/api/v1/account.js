const router = require('koa-router')();
const {OnlyUser} = require('../../../middlewares/permission');
router
  .get('/info', async (ctx, next) => {
    const {data, state, nkcModules} = ctx;
    const accountInfo = {
      logged: false,
      name: '',
      desc: '',
      avatar: '',
      uid: ''
    };
    if(state.uid) {
      accountInfo.logged = true;
      accountInfo.name = data.user.username;
      accountInfo.desc = data.user.description;
      accountInfo.uid = state.uid;
      accountInfo.avatar = nkcModules.tools.getUrl('userAvatar', data.user.avatar);
    }
    ctx.apiData = {
      accountInfo,
    };
    await next();
  })
  .get('/card', OnlyUser(),  async (ctx, next) => {
    const {data, nkcModules, db} = ctx;
    const userScores = await db.UserModel.getUserScores(data.user.uid);
    const userColumn = await db.UserModel.getUserColumn(data.user.uid);
    const hasColumn = !!userColumn;
    let columnUrl = '';
    if(hasColumn) {
      columnUrl = nkcModules.tools.getUrl('columnHome', userColumn._id)
    }
    const beta = (await db.DraftModel.getType()).beta;
    ctx.apiData = {
      cardInfo: {
        banner: nkcModules.tools.getUrl('userBanner', data.user.banner),
        gradeColor: data.user.grade.color,
        gradeName: data.user.grade.displayName,
        gradeIcon: nkcModules.tools.getUrl("gradeIcon", data.user.grade._id),
        certsName: await data.user.getCertsNameString(),
        scores: userScores? userScores.map(score => {
          score.icon = nkcModules.tools.getUrl('scoreIcon', score.icon);
          return score;
        }): [],
        xsf: data.user.xsf,
        xsfIcon: nkcModules.tools.getUrl('defaultFile', 'xsf.png'),
        hasColumn,
        columnUrl,
        draftCount: await db.DraftModel.countDocuments({uid: data.user.uid, type: beta}),
      }
    }
    await next();
  });
module.exports = router;
