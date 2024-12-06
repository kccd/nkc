window._lazyLoadInstance = new window.LazyLoad({
  elements_selector: '.lazyload',
  callback_enter: function (element) {
    element.classList.add('lazyloading');
  },
  callback_load: function (element) {
    element.classList.remove('lazyloading');
    element.classList.remove('lazyload');
    element.classList.add('lazyloaded');
  },
});
