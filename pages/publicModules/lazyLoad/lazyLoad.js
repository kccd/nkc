window._lazyLoadInstance = new window.LazyLoad({
  elements_selector: '.lazyload',
  callback_enter: function (element) {
    element.classList.add('lazyloading');
  },
  callback_loaded: function (element) {
    element.classList.remove('lazyloading');
    element.classList.remove('lazyload');
    element.classList.add('lazyloaded');
  },
});
