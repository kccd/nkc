import {strToObj} from "./dataConversion";
export function getState() {
  const state = {
    uid: '',
    isApp: false,
    appOS: '',
    platform: '',
    selectTypesWhenSubscribe: false,
    refererOperationId: '',
    fileDomain: '',
    websiteCode: '',
    websiteName: '',
    websiteBrief: '',
    column: '',
  };
  try{
    const windowDataDom = document.querySelector('meta[name="window-data"]');
    const windowData = strToObj(windowDataDom.getAttribute('content'));
    state.uid = windowData.uid;
    state.isApp = windowData.isApp;
    state.appOS = windowData.appOS;
    state.platform = windowData.platform;
    state.selectTypesWhenSubscribe = windowData.selectTypesWhenSubscribe;
    state.refererOperationId = windowData.refererOperationId;
    state.newMessageCount = 0;
    state.fileDomain = windowData.fileDomain;
    state.websiteCode = windowData.websiteCode;
    state.websiteName = windowData.websiteName;
    state.websiteBrief = windowData.websiteBrief;
    return state;
  } catch(err) {
    console.error(`获取 state 数据失败`);
    throw err;
  }
}
