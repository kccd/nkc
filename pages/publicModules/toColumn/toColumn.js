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
      selectMul: false,
      columnId: columnId,
      categories: [],
      exclude: [],
      category: "",
      column: "",
      loading: true,
      categoryId: "",

      categoriesId: [],

      info: "",
      error: ""
    },
    mounted: function() {
      $('#moduleToColumn').modal({
        show: false
      });
    },
    computed: {
      excludes: function() {
        var this_ = this;
        var exclude = this.exclude;
        var arr = [].concat(exclude);
        var func = function(ids) {
          for(var i = 0; i < ids.length; i++) {
            var id = ids[i];
            var childrenId = this_.getChildren(id);
            arr = arr.concat(childrenId);
            func(childrenId);
          }
        };
        func(exclude);
        return arr;
      }
    },
    methods: {
      getChildren: function(_id) {
        var arr = [];
        for(var i = 0; i < this.categories.length; i++) {
          var c = this.categories[i];
          if(c.parentId === _id) arr.push(c._id);
        }
        return arr;
      },
      show: function(func, options) {
        var this_ = this;
        if(func) moduleToColumn.callback = func;
        if(options) {
          this.exclude = options.exclude || [];
          this.selectMul = options.selectMul || false;
          this.categoriesId = options.selectedCid || [];
        }
        $('#moduleToColumn').modal("show");
        nkcAPI("/m/" + this.columnId + "/category?t=list", "GET")
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
        this.categoryId = "";
        this.categoriesId = [];
      },
      complete: function() {
        if(!this.categoryId) return screenTopWarning("请选择分类");
        if(!this.columnId || !this.uid) return screenTopWarning("数据加载中，请稍后重试");
        moduleToColumn.callback({
          categoryId: this.categoryId,
          columnId: this.columnId,
          uid: this.uid,
          categoriesId: this.categoriesId
        });
      }
    }
  });
  moduleToColumn.show = function(callback, options) {
    moduleToColumn.app.show(callback, options);
  };
  moduleToColumn.hide = function() {
    moduleToColumn.app.hide();
  };
};