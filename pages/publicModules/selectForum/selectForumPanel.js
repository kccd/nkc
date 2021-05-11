NKC.modules.SelectForumPanel = class {
  constructor() {
    this.domId = `forum_${Date.now()}`;
    this.app = null;
    this.layerIndex = null;
    this.layer = null;
  }
  open() {
    const self = this;
    if(self.layer) {
      return layer.setTop(self.layer);
    }
    self.layerIndex = layer.open({
      type: 1,
      shade: 0,
      offset: '100px',
      maxWidth: '100%',
      maxmin: true,
      zIndex: layer.zIndex,
      resize: false,
      success: function(layero) {
        self.layer = layero;
        layer.setTop(layero);
        self.app = new Vue({
          el: `#` + self.domId,
          data: {
            name: '这是一个可以重要也可以不重要的方法，重要的是，它的权利真的很大，尤其是在模块化加载layer时，你会发现你必须要用到它。它不仅可以配置一些诸如路径、加载的模块，甚至还可以决定整个弹层的默认参数。而说它不重要，是因为多数情况下，你会发现，你似乎不是那么十分需要它。但你真的需要认识一下这位伙计。',
          }
        });
      },
      end: function() {
        if(self.app) self.app.$destroy();
        delete self.layer;
      },
      title: '选择专业',
      content: `<div id="${self.domId}" class="nkc-layer-md">${$('#layerSelectForum').html()}</div>`
    });
  }
  close() {
    layer.close(this.layerIndex);
  }
}
