var moduleToColumn = {};
moduleToColumn.init = function(callback) {
  var dom = $('#moduleToColumn');
  var uid = dom.attr("data-uid");
  var columnId = dom.attr("data-column-id");
  moduleToColumn.callback = callback;
  moduleToColumn.app = new Vue({
    el: "#moduleToColumnVue",
    data: {
      uid: uid,
      columnId: columnId,
      categories: [],
      category: "",
      column: "",
      loading: true,
      categoryId: "",
      info: "",
      error: ""
    },
    mounted: function() {
      $('#moduleToColumn').modal({
        show: false
      });
    },
    methods: {
      show: function(func) {
        var this_ = this;
        if(func) moduleToColumn.callback = func;
        $('#moduleToColumn').modal("show");
        nkcAPI("/m/" + this.columnId + "/category", "GET")
          .then(function(data) {
            this_.column = data.column;
            this_.categories = data.categories;
            this_.loading = false;
            if(this_.categories.length > 0) {
              this_.categoryId = this_.categories[0]._id;
            }
          })
          .catch(function(data) {
            this_.error = data.error || data;
          })
      },
      hide: function() {
        $('#moduleToColumn').modal("hide");
      },
      complete: function() {
        if(!this.categoryId) return screenTopWarning("请选择分类");
        if(!this.columnId || !this.uid) return screenTopWarning("数据加载中，请稍后重试");
        moduleToColumn.callback({
          categoryId: this.categoryId,
          columnId: this.columnId,
          uid: this.uid
        });
      }
    }
  });
  moduleToColumn.show = function(callback) {
    moduleToColumn.app.show(callback);
  };
  moduleToColumn.hide = function() {
    moduleToColumn.app.hide();
  };
};