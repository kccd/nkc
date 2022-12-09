module.exports = async (ctx) => {
  const {state, nkcModules, template, remoteTemplate} = ctx;
  if(!template && !remoteTemplate) return;
  const userInfo = !state.uid? null: {
    uid: state.uid,
    name: state.user.username,
    avatar: nkcModules.tools.getUrl('userAvatar', state.user.avatar),
    banner: nkcModules.tools.getUrl('userBanner', state.user.banner),
    xsf: state.user.xsf,
    gradeId: state.user.grade._id,
    gradeName: state.user.grade.displayName,
    gradeColor: state.user.grade.color,
    gradeIcon: nkcModules.tools.getUrl("gradeIcon", state.user.grade._id),
  };

  ctx.remoteState = {
    uid: state.uid,
    userInfo,
    xsfIcon: nkcModules.tools.getUrl('defaultFile', 'xsf.png'),
    isProduction: process.env.NODE_ENV === 'production',
    url: state.url,
    isApp: state.isApp,
    appOS: state.appOS,
    platform: state.platform,
    operationId: state.operation._id,
    fileDomain: state.fileDomain,
    serverSettings: state.serverSettings,
    logoICO: state.logoICO,
    startTime: global.NKC.startTime,
    nkcSourceMask: {
      isDisplay: state.threadSettings.playerTips.isDisplay,
      tipContent: state.threadSettings.playerTips.tipContent
    },
    navbar: state.navbar || 'standard', // standard, full
  };
}
