$(function () {
  NKC.oneAfter("mathJaxRendered", function(_data, next) {
    const elements = document.querySelectorAll(`[data-type="nkc-render-content"]`);
    for(let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const source = element.getAttribute('data-source');
      const sid = element.getAttribute('data-sid');
      new NKC.modules.NKCHL({
        type: source,
        targetId: sid,
        notes: [],
        rootElement: element
      })
    }
  })
});