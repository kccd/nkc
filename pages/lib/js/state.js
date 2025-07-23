import { base64ToObj } from './dataConversion';
export function getState() {
  const state = {
    uid: '',
    isApp: false,
    appOS: '',
    platform: '',
    refererOperationId: '',
    fileDomain: '',
    websiteCode: '',
    websiteName: '',
    websiteBrief: '',
    column: '',
    isProduction: true,
    record: [],
    appVersionCode: 0,
  };
  try {
    const windowDataDom = document.querySelector('meta[name="window-data"]');
    const windowData = base64ToObj(windowDataDom.getAttribute('content'));
    state.uid = windowData.uid;
    state.isApp = windowData.isApp;
    state.appOS = windowData.appOS;
    state.platform = windowData.platform;
    state.refererOperationId = windowData.refererOperationId;
    state.newMessageCount = 0;
    state.fileDomain = windowData.fileDomain;
    state.websiteCode = windowData.websiteCode;
    state.websiteName = windowData.websiteName;
    state.websiteBrief = windowData.websiteBrief;
    state.about = windowData.about;
    state.app = windowData.app;
    state.links = windowData.links;
    state.telephone = windowData.telephone;
    state.gitHub = windowData.gitHub;
    state.statement = windowData.statement;
    state.copyright = windowData.copyright;
    state.record = windowData.record;
    state.isProduction = windowData.isProduction;
    state.appVersionCode = windowData.appVersionCode;
    return state;
  } catch (err) {
    console.error(`获取 state 数据失败`);
    throw err;
  }
}
