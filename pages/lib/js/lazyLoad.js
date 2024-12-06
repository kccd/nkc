export function lazyLoadInit() {
  if (!window._lazyLoadInstance) {
    return;
  }
  window._lazyLoadInstance.update();
}
