import { api as viewerApi } from "v-viewer";
import {RNViewImage} from "./reactNative";
import {getState} from "./state";
const state = getState();
const isReactNative = state.isApp && state.platform === 'reactNative';


/*
* @param {[Object]} images 图片信息
*   @param {String} name 图片名称
*   @param {String} url 图片链接
* @param {Number} index 打开后默认显示的图片索引
* */
export function openWebImageViewer(images = [], index = 0) {
  viewerApi({
    options: {
      toolbar: true,
      url: 'url',
      initialViewIndex: index
    },
    images,
  });
}

/*
* @param {[Object]} images 图片信息
*   @param {String} name 图片名称
*   @param {String} url 图片链接
* @param {Number} index 打开后默认显示的图片索引
* */
export function openImageViewer(images, index) {
  if(isReactNative) {
    RNViewImage(images, index);
  } else {
    openWebImageViewer(images, index);
  }
}

/*
* 打开指定url的图片
* @param {String} url
* */
export function openSingleImageByUrl(url) {
  openImageViewer([
    {
      url,
      name: url
    }
  ], 0)
}
