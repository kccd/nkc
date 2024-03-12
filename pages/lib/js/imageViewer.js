import { api as viewerApi } from "v-viewer";
import "viewerjs/dist/viewer.min.css";
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
      initialViewIndex: index,
      shown: () => {
        var right = document.createElement('li');
        var left = document.createElement('li');
        right.setAttribute('tabindex', '0');
        right.setAttribute('role', 'button');
        right.setAttribute(
          'class',
          'viewer-next picture-ban-before-right fa fa-chevron-circle-right',
        );
        right.setAttribute('data-viewer-action', 'next');
        right.setAttribute(
          'style',
          'position: absolute; top: calc( 50vh - 4rem ); right: 10%; transform: translate(-50%, -50%); color: white;',
        );

        left.setAttribute('tabindex', '0');
        left.setAttribute('role', 'button');
        left.setAttribute(
          'class',
          'viewer-prev picture-ban-before-left fa fa-chevron-circle-left',
        );
        left.setAttribute('data-viewer-action', 'prev');
        left.setAttribute(
          'style',
          'position: absolute; top: calc( 50vh - 4rem ); left: 10%; transform: translate(-100%, -50%); color: white;',
        );

        var viewerCanvas = document.querySelector('.viewer-container');
        viewerCanvas.insertAdjacentElement('beforeend', right);
        viewerCanvas.insertAdjacentElement('beforeend', left);
      },
      // view: (e) => {
      // },
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
