import {
  RNDownloadFile,
  RNEmit,
  RNOpenNewPage,
  RNSyncPageInfo,
  RNUrlPathEval,
  RNViewImage
} from '../lib/js/reactNative';
import {getState} from '../lib/js/state';
import {initLongPressEvent} from "../lib/js/longPress";
const {uid} = getState();

function RNInitLongPressEventToDownloadImage() {
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

function RNInitClientEvent() {
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
        const targetUrl = RNUrlPathEval(location.href, href);
        RNOpenNewPage(targetUrl, title)
      }
    }
  })
}

// 同步页面信息
RNSyncPageInfo({uid});
// 初始化链接点击事件
RNInitClientEvent();
// 初始化图片长按事件
RNInitLongPressEventToDownloadImage();