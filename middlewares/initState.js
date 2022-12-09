const nkcModules = require("../nkcModules");
const settings = require("../settings");
const db = require("../dataModels");
const serverConfig = require("../config/server");
module.exports = async (ctx, next) => {
  ctx.state = {
    logoICO: nkcModules.tools.getUrl('siteIcon', 'ico'),
    url: ctx.url.replace(/\?.*/ig, ""),
    // app请求的标识
    isApp: false,
    // app所在系统:  android, ios
    appOS: undefined,
    // app平台: apiCloud, reactNative
    platform: undefined,
    // ReactNative
    twemoji: settings.editor.twemoji,
    // 当前操作
    operation: await db.OperationModel.getOperationById(ctx.data.operationId),
    // - 初始化网站设置
    pageSettings: await db.SettingModel.getSettings("page"),
    postSettings: await db.SettingModel.getSettings("post"),
    serverSettings: await db.SettingModel.getSettings("server"),
    stickerSettings: await db.SettingModel.getSettings("sticker"),
    logSettings: await db.SettingModel.getSettings("log"),
    threadSettings: await db.SettingModel.getSettings('thread'),
    // 缓存相关
    cachePage: false,
    fileDomain: serverConfig.fileDomain || ''
  };

  // 下载附件是否需要积分
  ctx.state.threadListStyle = Object.assign({}, ctx.state.pageSettings.threadListStyle);

  // 判断是否为APP发起的请求
  // apiCloud: NKC/APP/android
  // ReactNative: rn-android、rn-ios
  let userAgent = ctx.header["user-agent"] || "";
  let reg = /NKC\/APP\/(.+)/;
  userAgent = reg.exec(userAgent);
  if(userAgent !== null && ['rn-android', 'rn-ios', 'android'].includes(userAgent[1])) {
    const _userAgent = userAgent[1];
    ctx.state.isApp = true;
    ctx.state.appOS = _userAgent.replace('rn-', '');
    if(_userAgent === 'android') {
      // 兼容apiCloud
      ctx.state.platform = 'apiCloud';
    } else {
      ctx.state.platform = 'reactNative';
    }
  }
  await next();
}
