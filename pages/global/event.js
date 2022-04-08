import {openImageViewer} from '../lib/js/imageViewer';
import {strToObj} from "../lib/js/dataConversion";
import {initLongPressEvent} from "../lib/js/longPress";
import {getState} from "../lib/js/state";
import {
  RNDownloadFile,
  RNOpenNewPage, RNSaveImage,
  RNUrlPathEval
} from "../lib/js/reactNative";
import {throttle} from "../lib/js/execution";

const state = getState();
const isReactNative = state.isApp && state.platform === 'reactNative';

/*
* 查看单张图片
* @param {Object} data
*   @param {String} url 图片链接
*   @param {String} name 图片名称
* */
function viewImage(data) {
  const {
    name = '',
    url = ''
  } = data;
  const images = [{
    name,
    url
  }];
  openImageViewer(images, 0);
}
/*
* 查看多张图片
* @param {Object} data
*   @param {[Object]} images
*     @param {String} url 图片链接
*     @param {String} name 图片名称
*   @param {Number} index 默认打开的图片索引
* */
function viewImages(data) {
  const {images, index} = data;
  openImageViewer(images, index);
}

/*
* 下载文件
* @param {Object} data
*   @param {String} name 文件名称
*   @param {String} url 文件链接
* */
function downloadFile(data) {
  const {name, url} = data;
  RNDownloadFile(name, url)
}

/*
* 保存图片到相册
* @param {Object}
*   @param {String} name 图片文件名
*   @param {String} url 图片链接
* */
function saveImage(data) {
  const {name, url} = data;
  RNSaveImage(name, url);
}

/*
* 显示用户悬浮名片
* */
function showUserPanel(data, dom) {
  const DOM = $(dom);
  window.showFloatUserPanel(data, dom);
}

/*
* 鼠标移出隐藏用户名片
* */
function hideUserPanel(data, dome) {
  window.initMouseleaveEvent()
}

/*
* data-global-click 和 data-global-long-press 合法的操作
* */
const eventFunctions = {
    viewImage,
    viewImages,
    downloadFile,
    saveImage,
    showUserPanel,
    hideUserPanel,
  }

/*
* 点击事件、触摸时间触发之后执行的函数，统一处理
* @param {String} eventType 时间类型 click, long-press, mouseover
* @param {Event}
* */
function globalEvent(eventType, e) {
  const element = e.target;
  const elementJQ = $(element);
  let operation = elementJQ.attr(`data-global-${eventType}`);
  //获取点击元素的父级元素中包含该属性的元素， 不查找包含该属性的子级
  if(!operation) {
    const doms = elementJQ.parents(`[data-global-${eventType}]`);
    const dom = doms.eq(0);
    const val = dom.attr(`data-global-${eventType}`);
    if(val) {
      operation = val;
    }
  }
  if(!operation) return;
  const eventFunction = eventFunctions[operation];
  if(!eventFunction) return;
  let data = elementJQ.attr('data-global-data');
  data = strToObj(data);
  eventFunction(data, elementJQ);
}

/*
* 监听全局点击事件
* data-global-click=operation
* data-global-data='' object json string
* */
export function initGlobalClickEvent() {
  document.addEventListener('click', e => {
    globalEvent('click', e);
  });
}

/*
* 监听长按事件
* */
export function initGlobalLongPressEvent() {
  initLongPressEvent(document, e => {
    globalEvent('long-press', e);
  });
}

/*
* 监听鼠标移入移出悬浮事件
* */
export function initGlobalMouseOverEvent() {
  //鼠标移入
  document.addEventListener('mouseover', e => {
    globalEvent('mouseover', e);
  });
  //鼠标移出
  document.addEventListener('mouseout', e => {
    globalEvent('mouseout', e);
  });
}

/*
* APP 监听点击 a 标签
* */
export function initAppGlobalClickLinkEvent() {
  if(!isReactNative) return;
  // 限流 限制点击链接最小间隔时间为1000ms
  // 防止app同时打开多个相同的页面
  const handle = throttle(function(e) {
    let element = e.target;
    let elementJQ = $(element);
    const tagName = element.nodeName.toLowerCase();
    if(tagName !== 'a') {
      element = elementJQ.parents('a');
      if(element.length === 0) return;
      element = element[0];
      elementJQ = $(element);
    }
    const dataType = elementJQ.attr('data-type');
    // 判断是否不需要新窗打开，待改
    if(dataType === 'reload') return;
    const href = elementJQ.attr('href');
    if(!href) return;
    const title = elementJQ.attr('title') || '';
    const targetUrl = RNUrlPathEval(window.location.href, href);
    RNOpenNewPage(targetUrl, title);
    e.preventDefault();
  }, 1000);
  document.addEventListener('click', handle);
}
