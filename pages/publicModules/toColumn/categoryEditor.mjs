class EditColumnCategory extends NKC.modules.DraggablePanel {
  constructor() {
    const domId = `#moduleCreateColumnCategoryApp`;
    super(domId);
    const self = this;
    self.dom = $(domId);
    self.app = new Vue({
      el: domId + 'App',
      data: {
        loading: true,
        category: {

        }
      }
    });
  }
}