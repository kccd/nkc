const nkcModules = require('../nkcModules');
const settings = require('../settings');
const db = require('../dataModels');
const serverConfig = require('../config/server');
module.exports = async (ctx, next) => {
  ctx.state = {
    logoICO: nkcModules.tools.getUrl('siteIcon', 'ico'),
    url: ctx.url.replace(/\?.*/gi, ''),
    // app请求的标识
    isApp: false,
    // app所在系统:  android, ios
    appOS: undefined,
    // 版本号
    appVersion: '0.0.0',
    appVersionCode: 0,
    // app平台: apiCloud, reactNative
    platform: undefined,
    // ReactNative
    twemoji: settings.editor.twemoji,
    // 当前操作
    // operation: await db.OperationModel.getOperationById(ctx.data.operationId),
    operationId: ctx.data.operationId,
    // - 初始化网站设置
    pageSettings: await db.SettingModel.getSettings('page'),
    postSettings: await db.SettingModel.getSettings('post'),
    serverSettings: await db.SettingModel.getSettings('server'),
    stickerSettings: await db.SettingModel.getSettings('sticker'),
    threadSettings: await db.SettingModel.getSettings('thread'),
    // 缓存相关
    cachePage: false,
    fileDomain: serverConfig.fileDomain || '',
  };

  // 下载附件是否需要积分
  ctx.state.threadListStyle = Object.assign(
    {},
    ctx.state.pageSettings.threadListStyle,
  );

  // 判断是否为APP发起的请求
  // apiCloud: NKC/APP/android
  // ReactNative: rn-android、rn-ios
  // 例子 NKC/APP/rn-android/0.5.2-6
  const userAgent = (ctx.header['user-agent'] || '').split('/');
  if (
    userAgent[0] === 'NKC' &&
    userAgent[1] === 'APP' &&
    ['rn-android', 'rn-ios', 'android'].includes(userAgent[2])
  ) {
    ctx.state.isApp = true;
    ctx.state.appOS = userAgent[2].replace('rn-', '');
    ctx.state.platform =
      userAgent[2] === 'android' ? 'apiCloud' : 'reactNative';
    if (userAgent[3]) {
      const [version, versionCode] = userAgent[3].split('-');
      ctx.state.appVersion = version.trim();
      ctx.state.appVersionCode = parseInt(versionCode);
    }
  }
  await next();
};
