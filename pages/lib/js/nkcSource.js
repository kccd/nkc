import {strToObj, objToStr} from "./dataConversion";

export function initNKCRenderImagesView() {
  const imageElements = $('.render-content img[data-global-click="viewImage"]');
  const images = [];
  for(let i = 0; i < imageElements.length; i++) {
    const imageElement = imageElements.eq(i);
    const image = {
      url: '',
      name: ''
    };
    let data = imageElement.attr('data-global-data');
    if(data) {
      data = strToObj(data) || {};
      if(!data.url || !data.name) continue;
      image.url = data.url;
      image.name = data.name;
    }
    images.push(image);
  }
  for(let i = 0; i < images.length; i ++) {
    const imageElement = imageElements.eq(i);
    imageElement
      .attr('data-global-click', 'viewImages')
      .attr('data-global-data', objToStr({
        images,
        index: i
      }));
  }
}
