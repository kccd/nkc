import {sweetQuestion} from "./sweetAlert";
import {getState} from "./state";
import {fixUrl} from "./url";
import {throttle} from "./execution";
const state = getState();
const isReactNative = state.isApp && state.platform === 'reactNative';

const reactNativeCallback = {};
let reactNativeIndex = 0;

export function RNPostMessage(obj) {
  if(!isReactNative) return;
  window.ReactNativeWebView.postMessage(JSON.stringify(obj));
}

/*
* 立即向RN发送事件
* @param {String} type 事件名
* @param {Object} data 发送的数据
* @param {Function} callback 回调函数
* */
export function RNEmitCore(type, data, callback) {
  if(!isReactNative) return;
  data = data || {};
  var index = reactNativeIndex ++;
  reactNativeCallback[index] = callback;
  RNPostMessage({
    type: type,
    data: data,
    webFunctionId: index
  });
}

/*
* 立即向RN发送事件，但间隔时间最小为1000ms，小于1000ms内的调用将被忽略
* @param {String} type 事件名
* @param {Object} data 发送的数据
* @param {Function} callback 回调函数
* */
export const RNEmit = throttle(RNEmitCore, 1000);

export function RNOnMessage(res) {
  var webFunctionId = res.webFunctionId;
  var data = res.data;
  var func = reactNativeCallback[webFunctionId];
  if(func) {
    func(data);
  }
}

export function RNUrlPathEval(fromUrl, toUrl) {
  if (!toUrl) {
    toUrl = fromUrl;
    fromUrl = location.href;
  }
  let fullFromUrl = new URL(fromUrl, location.origin);
  return new URL(toUrl, fullFromUrl).href;
}


/*
* 通知 ReactNative 下载文件
* @param {String} filename 文件名
* @param {String} 下载链接
* */
export function RNDownloadFile(filename, url, callback) {
  url = RNUrlPathEval(location.href, url);
  filename = filename || (Date.now()+ '_' + Math.floor(Math.random() * 1000) + '.file');
  return sweetQuestion(`确定要下载文件「${filename}」至 Download 目录?`)
    .then(() => {
      RNEmit('downloadFile', {
        url,
        filename
      }, (res) => {
        if(callback) callback(res);
      });
    })
}

/*
* 获取文件列表
* */
export function RNGetFiles(data, callback) {
  return RNEmit('getFiles', {
    data
  }, function (res){
    callback = res;
  });
}

/*
* 调用 APP 音乐播放器，替换播放列表并播放
* @param {[Object]} list 音乐列表
*   @param {String} url 音频链接
*   @param {String} name 音频名称
*   @param {String} from 音频来源
* */
export function RNUpdateMusicListAndPlay(list, callback) {
  RNEmit('updateMusicListAndPlay', {list}, callback);
}

/*
* RN打开文件
* */
export function RNOpenFile(data, callback) {
  RNEmit('openFile', data, callback);
}

/*
* RN控制台打印
* @param {任意数据类型} data 需打印的内容
* */
export function RNConsoleLog(data) {
  RNEmit('consoleLog', {
    content: data
  });
}

/*
* RN删除文件
* */
export function RNDeleteFile(data, callback) {
  RNEmit('delFile', data, callback);
}

/*
* 同步网站用户到RN
* */
export function RNLogin() {
  RNEmit('login');
}

/*
* @param {[Object]} images 图片信息
*   @param {String} name 图片名称
*   @param {String} url 图片链接
* @param {Number} index 打开后默认显示的图片索引
* */
export function RNViewImage(urls, index) {
  for(const url of urls) {
    url.url = fixUrl(url.url);
  }
  RNEmit('viewImage', {
    urls,
    index,
  });
}

/*
* 关闭当前页面
* @param {Object} data
*   @param {Boolean} drawer
* */
export function RNCloseWebview(data) {
  RNEmit('closeWebView', data);
}

/*
* RN退出登录
* */
export function RNLogout() {
  RNEmit('logout');
}

/*
* RN打开检查更新页面
* */
export function RNOpenUpgradePage() {
  RNEmit('openUpgradePage');
}

/*
* RN打开编辑器页面
* @param {String} url 编辑器页面链接
* */
export function RNOpenEditorPage(url) {
  RNEmit("openEditorPage", {
    url
  });
}

/*
* RN更新已登录用户信息
* */
export function RNUpdateLocalUser() {
  RNEmit("updateLocalUser", {});
}

/*
* RN打开新页面（不关闭原来的页面）
* @param {String} url 新页面链接
* @param {String} title 页面标题
* */
export function RNOpenNewPage(url, title = '') {
  RNEmit('openNewPage', {href: url, title});
}

export const RNOpenNewPageThrottle = throttle(function(url, title = ''){
  RNOpenNewPage(url, title);
}, 100);

/*
* RN打开RN屏幕
* @param {String} name 屏幕名
* @param {Object} params 屏幕接收的参数
* */
export function RNOpenNativeScreen(name, params = {}) {
  RNEmit('openNativeScreen', {
    name,
    params
  });
}

/*
* 拍照并上传到resource
* @param {Object} data 空对象
* @param {Function} callback 上传成功后的回调
* */
export function RNTakePictureAndUpload(data, callback) {
  RNEmit('takePictureAndUpload', data, callback);
}
/*
* 拍摄照片并发送给用户
* @param {Object} data
*   @param {String} uid 对方UID
* @param {Function} callback 发送完成之后的回调
* */
export function RNTakePictureAndSendToUser(data, callback) {
  RNEmit('takePictureAndSendToUser', data, callback);
}
/*
* 录制视频并上传到resource
* @param {Object} data 空对象
* @param {Function} callback 上传成功后的回调
* */
export function RNTakeVideoAndUpload(data, callback) {
  RNEmit('takeVideoAndUpload', data, callback);
}
/*
* 拍摄照片并发送给用户
* @param {Object} data
*   @param {String} uid 对方UID
* @param {Function} callback 发送完成之后的回调
* */
export function RNTakeVideoAndSendToUser(data, callback) {
  RNEmit('takeVideoAndSendToUser', data, callback);
}

/*
* 录音并上传到resource
* @param {Object} data 空对象
* @param {Function} callback 上传成功后的回调
* */
export function RNTakeAudioAndUpload(data, callback) {
  RNEmit('takeAudioAndUpload', data, callback);
}

/*
* 拍摄照片并发送给用户
* @param {Object} data
*   @param {String} uid 对方UID
* @param {Function} callback 发送完成之后的回调1
* */
export function RNTakeAudioAndSendToUser(data, callback) {
  RNEmit('takeAudioAndSendToUser', data, callback)
}


/*
* RN底部气泡弹窗
* @param {Object} data
*   @param {String} content 需显示的内容
* */
export function RNToast(data) {
  const {content} = data;
  RNEmit('toast', {content});
}

/*
* 获取输入法键盘状态
* @param {Function} callback 回调，接收如下参数
*   @param {Object}
*     @param {String} keyboardStatus show(显示状态) hide(隐藏状态)
* */
export function RNGetKeyboardStatus(callback) {
  RNEmit('getKeyboardStatus', {}, callback);
}

/*
* RN打开消息对话框
* @param {Object} data
*   @param {String} type 对话类型 UTU, STU, STE
*   @param {String} uid UTU时，对方ID
*   @param {String} username 对方名称
* */
export function RNToChat(data) {
  const {
    type,
    uid,
    username
  } = data;
  RNEmit('toChat', {
    type,
    uid,
    username
  });
}

/*
* RN打开新页面，然后关闭旧页面
* @param {String} url 新页面链接
* */
export function RNVisitUrlAndClose(url) {
  url = fixUrl(url);
  RNEmit('openNewPageAndClose', {href: url})
}

/*
* RN打开登录或注册页面
* @param {String} type login(登录) register(注册)
* */
export function RNOpenLoginPage(type) {
  RNEmit('openLoginPage', {type})
}

/*
* 刷新RN Webview页面
* */
export function RNReloadWebview() {
  RNEmit('reloadWebView');
}

/*
* 选择地区
* @return {[String]} 地区名称组成的数组
* */
export function RNSelectLocation() {
  return new Promise(resolve => {
    RNEmit('selectLocation', {}, resolve);
  });
}

/*
* 调用RN微信支付
* @param {Object} data
*   @param {String} url
*   @param {String} H5Url
*   @param {String} referer
* */
export function RNWechatPay(data) {
  const {
    url,
    H5Url,
    referer
  } = data;
  RNEmit('', {
    url,
    H5Url,
    referer
  });
}

/*
* 传递页面相关信息到RN
* @param {Object} data
*   @param {String} uid
* */
export function RNSyncPageInfo(data) {
  const {uid} = data;
  RNEmit('syncPageInfo', {
    uid
  });
}

/*
* 保存图片到相册
* @param {Object} data
*   @param {String} name 图片文件名
*   @param {String} url 图片链接
* */
export function RNSaveImage(data) {
  const {url, name} = data;
  // 此接口待RN更新后需调整
  RNEmit('longViewImage', {
    urls: [
      {
        url, name
      }
    ],
    index: 0,
  });
}

/*
* 打开app下载列表
* */
export function RNOpenDownloadList() {
  RNEmit('openDownloadList');
}

/*
* 同步网页 title
* */
export function RNSetPageTitle(title) {
  RNEmitCore('syncPageTitle', {
    title
  });
}
/*
* thread系列触发分享显示
* */
export function RNSetSharePanelStatus(show = true,type,id) {
  RNEmit('setSharePanelStatus', {
    show,
    type,
    id
  });
}
