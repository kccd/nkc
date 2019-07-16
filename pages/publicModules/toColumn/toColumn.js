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

      createCategory: false,
      newCategory: {
        parentId: "",
        name: "",
        description: ""
      },

      info: "",
      error: ""
    },
    mounted: function() {
      var this_ = this;
      $('#moduleToColumn').modal({
        show: false
      });
      $('#moduleCrop').on('hidden.bs.modal', function () {
        this_.createCategory = false;
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
      saveCategory: function() {
        var this_ = this;
        var category = this.newCategory;
        if(!category.name) return this.error = "请输入分类名";
        if(!category.description) return this.error = "请输入分类介绍";
        nkcAPI("/m/" + this.column._id + "/category", "POST", category)
          .then(function() {
            this_.getCategories();
            this_.createCategory = false;
            this_.newCategory = {
              name: "",
              description: "",
              parentId: ""
            };
          })
          .catch(function(data) {
            this_.error = data.error || data;
          });
      },
      addCategory: function() {
        this.createCategory = true;
      },
      cancelAddCategory: function() {
        this.createCategory = false;
      },
      getChildren: function(_id) {
        var arr = [];
        for(var i = 0; i < this.categories.length; i++) {
          var c = this.categories[i];
          if(c.parentId === _id) arr.push(c._id);
        }
        return arr;
      },
      getCategories: function() {
        var this_ = this;
        nkcAPI("/m/" + this.columnId + "/category?t=list", "GET")
          .then(function(data) {
            this_.column = data.column;
            for(var i = 0; i < data.categories.length; i++) {
              var c = data.categories[i];
              var str = "";
              for(var j = 0; j < c.level; j++) {
                str += "&nbsp;&nbsp;&nbsp;";
              }
              c.str = str;
            }
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
      show: function(func, options) {
        if(func) moduleToColumn.callback = func;
        if(options) {
          this.exclude = options.exclude || [];
          this.selectMul = options.selectMul || false;
          this.categoriesId = options.selectedCid || [];
        }
        $('#moduleToColumn').modal("show");
        this.getCategories();
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