NKC.modules.SelectColumnCategories = function() {
  var this_ = this;
  this_.dom = $("#moduleSelectColumnCategories");
  this_.columnId = this_.dom.attr("data-column-id");
  var toColumn = !!this_.dom.attr("data-to-column");
  this_.app = new Vue({
    el: "#moduleSelectColumnCategories",
    data: {
      loaded: false,
      choose: toColumn?[true]:[],
      mainCategories: [],
      minorCategories: [],
      selectedMainCategoriesId: [],
      selectedMinorCategoriesId: [],

      error: "",
      createCategory: false,
      newCategory: {
        parentId: "",
        name: "",
        description: "",
        type: 'main'
      },
    },
    mounted: function() {
      if(this.choose.length) {
        this.getCategories();
      }
    },
    methods: {
      getMainCategoryById: function(_id) {
        for(var i = 0; i < this.mainCategories.length; i++) {
          if(this.mainCategories[i]._id === _id) return this.mainCategories[i];
        }
      },
      getMinorCategoryById: function(_id) {
        for(var i = 0; i < this.minorCategories.length; i++) {
          if(this.minorCategories[i]._id === _id) return this.minorCategories[i];
        }
      },
      getCategories: function() {
        nkcAPI("/m/" + this_.columnId + "/category?from=fastPost", "GET")
          .then(function(data) {
            this_.app.loaded = true;
            for(var i = 0; i < data.mainCategories.length; i++) {
              var c = data.mainCategories[i];
              var str = "";
              for(var j = 0; j < c.level; j++) {
                str += "&nbsp;&nbsp;&nbsp;";
              }
              c.str = str;
            }
            this_.app.mainCategories = data.mainCategories;
            this_.app.minorCategories = data.minorCategories;
          })
          .catch(function(data) {
            this_.app.loaded = true;
            sweetError(data);
          });
      },
      saveCategory: function() {
        var app = this;
        this.error = "";
        var category = this.newCategory;
        if(!category.type) return this.error = "请选择分类类型";
        if(!category.name) return this.error = "请输入分类名";
        if(!category.description) return this.error = "请输入分类介绍";
        nkcAPI("/m/" + this_.columnId + "/category", "POST", category)
          .then(function() {
            app.getCategories();
            app.createCategory = false;
            app.newCategory = {
              name: "",
              description: "",
              parentId: "",
              type: 'main'
            };
          })
          .catch(function(data) {
            sweetError(data);
          });
      },
      addCategory: function() {
        this.createCategory = true;
      },
      cancelAddCategory: function() {
        this.createCategory = false;
      },
    },
    computed: {
      selectedMainCategories: function() {
        var arr = [];
        for(var i = 0; i < this.selectedMainCategoriesId.length; i++) {
          var c = this.getMainCategoryById(this.selectedMainCategoriesId[i]);
          if(c) arr.push(c);
        }
        return arr;
      },
      selectedMinorCategories: function() {
        var arr = [];
        for(var i = 0; i < this.selectedMinorCategoriesId.length; i++) {
          var c = this.getMinorCategoryById(this.selectedMinorCategoriesId[i]);
          if(c) arr.push(c);
        }
        return arr;
      }
    },
    watch: {
      choose: function() {
        if(this.choose.length > 0 && this.mainCategories.length === 0) {
          this.getCategories();
        } else {
          this_.app.loaded = false;
          this_.app.mainCategories = [];
          this_.app.selectedMainCategoriesId = [];
          this_.app.minorCategories = [];
          this_.app.selectedMinorCategoriesId = [];
        }
      }
    }
  });
  this_.getStatus = function() {
    return {
      selectedMainCategories: this_.app.selectedMainCategories,
      selectedMainCategoriesId: this_.app.selectedMainCategoriesId,
      selectedMinorCategories: this_.app.selectedMinorCategories,
      selectedMinorCategoriesId: this_.app.selectedMinorCategoriesId,
      checkbox: this_.app.choose.length > 0
    }
  };
};