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
      mainCategories: [],
      minorCategories: [],
      exclude: [],
      category: "",
      column: "",
      loading: true,
      mainCategoryId: "",
      minorCategoryId: '',


      mainCategoriesId: [],
      minorCategoriesId: [],


      createCategory: false,



      newCategory: {
        parentId: "",
        name: "",
        description: "",
        type: 'main' // main, minor
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
              parentId: "",
              type: 'main'
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
        for(var i = 0; i < this.mainCategories.length; i++) {
          var c = this.mainCategories[i];
          if(c.parentId === _id) arr.push(c._id);
        }
        return arr;
      },
      getCategories: function() {
        var this_ = this;
        nkcAPI("/m/" + this.columnId + "/category?from=dialog", "GET")
          .then(function(data) {
            this_.column = data.column;
            for(var i = 0; i < data.mainCategories.length; i++) {
              var c = data.mainCategories[i];
              var str = "";
              for(var j = 0; j < c.level; j++) {
                str += "&nbsp;&nbsp;&nbsp;";
              }
              c.str = str;
            }
            this_.mainCategories = data.mainCategories;
            this_.minorCategories = data.minorCategories;
            this_.loading = false;
            if(this_.mainCategories.length > 0) {
              this_.mainCategoryId = this_.mainCategories[0]._id;
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
          this.mainCategoriesId = options.selectedMainCategoriesId || options.selectedCid || [];
          this.minorCategoriesId = options.selectedMinorCategoriesId || [];
        }
        $('#moduleToColumn').modal("show");
        this.getCategories();
      },
      hide: function() {
        $('#moduleToColumn').modal("hide");
        this.mainCategoryId = "";
        this.minorCategoryId = '';
        this.minorCategoriesId = [];
        this.mainCategoriesId = [];
      },
      complete: function() {
        if(!this.mainCategoryId) return screenTopWarning("请选择分类");
        if(!this.columnId || !this.uid) return screenTopWarning("数据加载中，请稍后重试");
        moduleToColumn.callback({
          mainCategoryId: this.mainCategoryId,
          minorCategoryId: this.minorCategoryId,
          columnId: this.columnId,
          uid: this.uid,
          mainCategoriesId: this.mainCategoriesId,
          minorCategoriesId: this.minorCategoriesId
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

window.moduleToColumn = moduleToColumn;