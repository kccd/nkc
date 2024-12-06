import { initNKCRenderImagesView } from '../lib/js/nkcSource';
import { lazyLoadInit } from '../lib/js/lazyLoad';

window.$(function () {
  window.NKC.methods.highlightNKCSource();
  initNKCRenderImagesView();
  lazyLoadInit();
});
