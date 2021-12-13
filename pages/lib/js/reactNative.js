import {initLongPressEvent} from "./longPress";
import {sweetQuestion} from "./sweetAlert";
const reactNativeCallback = {};
let reactNativeIndex = 0;

export function RNPostMessage(obj) {
  window.ReactNativeWebview.postMessage(JSON.stringify(obj));
}

export function RNEmit(type, data, callback) {
  data = data || {};
  var index = reactNativeIndex ++;
  reactNativeCallback[index] = callback;
  RNPostMessage({
    type: type,
    data: data,
    webFunctionId: index
  });
}

export function RNOnMessage(res) {
  var webFunctionId = res.webFunctionId;
  var data = res.data;
  var func = reactNativeCallback[webFunctionId];
  if(func) {
    func(data);
  }
}

export function urlPathEval(fromUrl, toUrl) {
  if (!toUrl) {
    toUrl = fromUrl;
    fromUrl = location.href;
  }
  let fullFromUrl = new URL(fromUrl, location.origin);
  return new URL(toUrl, fullFromUrl).href;
}

export function RNInitLongPressEventToDownloadImage() {
  initLongPressEvent(document, (e) => {
    const target = e.target;
    const targetNodeName = target.nodeName.toLowerCase();
    const dataType = target.getAttribute('data-type');
    let src = target.getAttribute('data-src');
    if(!src) src = target.getAttribute('src');
    if(targetNodeName === 'img' && dataType === 'view' && src) {
      if(src.indexOf('http') !== 0) {
        src = window.location.origin + src;
      }
      const name = target.getAttribute('alt') || '';
      RNEmit('longViewImage', {
        urls: [
          {
            url: src,
            name
          }
        ],
        index: 0,
      });
      e.preventDefault();
    }
  })
}

export function RNInitClientEvent() {
  document.addEventListener('click', e => {
    const target = e.target;
    const targetNodeName = target.nodeName.toLowerCase();
    const dataType = target.getAttribute('data-type');
    let src = target.getAttribute('data-src');
    if(!src) src = target.getAttribute('src');
    if(targetNodeName === 'img' && dataType === 'view' && src) {
      if(src.indexOf('http') !== 0) {
        src = window.location.origin + src;
      }
      // 图片处理
      const images = document.querySelectorAll('img[data-type="view"]');
      const urls = [];
      let index;
      for(let i = 0; i < images.length; i++) {
        const image = images[i];
        const name = image.getAttribute('alt');
        let _src = image.getAttribute('data-src');
        if(!_src) {
          _src = image.getAttribute('src');
        }
        if(!_src) return;
        if(_src.indexOf('http') !== 0) {
          _src = window.location.origin + _src;
        }
        if(_src === src) {
          index = i;
        }
        urls.push({
          url: _src,
          name
        });
      }
      RNViewImage(urls, index);
      e.preventDefault();
    } else {
      // 链接处理
      let $a;
      if (targetNodeName === 'a') {
        $a = target;
      } else {
        $a = $(target).parents('a');
        if($a.length) $a = $a[0];
      }
      let href, title;
      if($a && $a.getAttribute) {
        href = $a.getAttribute('href');
        title = $a.getAttribute('title');
      }
      if(!href) return;
      const aDataType = $a.getAttribute('data-type');
      const aDataTitle = $a.getAttribute('data-title');
      if(aDataType === 'download') {
        e.preventDefault();
        RNDownloadFile(aDataTitle, href);
      } else if(aDataType !== 'reload') {
        e.preventDefault();
        const targetUrl = urlPathEval(location.href, href);
        RNOpenNewPage(targetUrl, title)
      }
    }
  })
}
/*
* 通知 ReactNative 下载文件
* @param {String} filename 文件名
* @param {String} 下载链接
* */
export function RNDownloadFile(filename, url, callback) {
  url = urlPathEval(location.href, url);
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

export function RNOpenFile(data, callback) {
  RNEmit('openFile', data, callback);
}

export function RNConsoleLog(data) {
  RNEmit('consoleLog', {
    content: data
  });
}

export function RNDeleteFile(data, callback) {
  RNEmit('delFile', data, callback);
}

export function RNLogin() {
  RNEmit('login');
}

export function RNViewImage(urls, index) {
  RNEmit('viewImage', {
    urls,
    index,
  });
}

export function RNCloseWebview(data) {
  RNEmit('closeWebView', data);
}

export function RNLogout() {
  RNEmit('logout');
}

export function RNCheckAndUpdateApp() {
  RNEmit('check_and_update_app');
}

export function RNOpenEditorPage(url) {
  RNEmit("openEditorPage", {
    url
  });
}

export function RNUpdateLocalUser() {
  RNEmit("updateLocalUser", {});
}

export function RNOpenNewPage(url, title = '') {
  RNEmit('openNewPage', {href: url, title});
}

export function RNTakePictureAndUpload(data, callback) {
  RNEmit('takePictureAndUpload', data, callback);
}
export function RNTakeVideoAndUpload(data, callback) {
  RNEmit('takeVideoAndUpload', data, callback);
}
export function RNTakeAudioAndUpload(data, callback) {
  RNEmit('takeAudioAndUpload', data, callback);
}

export function RNToast(data) {
  RNEmit('toast', data);
}

export function RNGetKeyboardStatus(callback) {
  RNEmit('getKeyboardStatus', {}, callback);
}
export function RNToChat(data) {
  RNEmit('toChat', data);
}
export function RNVisitUrlAndClose(url) {
  if(url.indexOf('http') !== 0) url = window.location.origin + url;
  RNEmit('openNewPageAndClose', {href: url})
}
export function RNOpenLoginPage(type) {
  RNEmit('openLoginPage', {type})
}
export function RNReloadWebview() {
  RNEmit('reloadWebView');
}
export function RNSelectLocation() {
  return new Promise(resolve => {
    RNToast('selectLocation', {}, resolve);
  });
}
export function RNWechatPay(data) {
  RNEmit('weChatPay', data);
}
export function RNSyncPageInfo(data) {
  RNEmit('syncPageInfo', data);
}