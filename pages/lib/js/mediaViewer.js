import { openImageViewer } from './imageViewer';
import { getState } from './state';
const state = getState();
const isReactNative = state.isApp && state.platform === 'reactNative';
/*
 * 查看单张图片
 * @param {Object} data
 *   @param {String} url 图片链接
 *   @param {String} name 图片名称
 * */
export function viewImage(data) {
  const { name = '', url = '' } = data;
  const images = [
    {
      name,
      url,
    },
  ];
  if (isReactNative) {
    openImageViewer(images, 0);
  } else {
    const readyFiles = images.map((item) => {
      return { ...item, type: 'picture' };
    });
    window.RootApp.$refs.preview.setData(true, 0, readyFiles);
    window.RootApp.$refs.preview.init(0);
  }
}
/*
 * 查看多张图片
 * @param {Object} data
 *   @param {[Object]} images
 *     @param {String} url 图片链接
 *     @param {String} name 图片名称
 *   @param {Number} index 默认打开的图片索引
 * */
export function viewImages(data) {
  const { images, index } = data;
  if (isReactNative) {
    openImageViewer(images, index);
  } else {
    const readyFiles = images.map((item) => {
      return { ...item, type: 'picture' };
    });
    window.RootApp.$refs.preview.setData(true, index, readyFiles);
    window.RootApp.$refs.preview.init(index);
  }
}

/* 
  查看多个媒体文件（图片、视频）
  @param {Object} data
 *   @param {[Object]} items
       @param {String} type 类型 picture or video
 *     @param {String} url 图片链接
 *     @param {String} name 图片名称
 *   @param {Number} index 默认打开的图片索引
*/
export function viewMedias(data) {
  const { medias, index } = data;
  const mediasFixed = [];
  for (const item of medias) {
    const { type, url, name } = item;
    if (!['picture', 'video'].includes(type) || !url) {
      continue;
    }
    mediasFixed.push({
      type,
      url,
      name: name || '',
    });
  }
  window.RootApp.$refs.preview.setData(true, index, mediasFixed);
  window.RootApp.$refs.preview.init(index);
}
