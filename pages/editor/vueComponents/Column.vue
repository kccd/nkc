<template lang="pug">
.column
  .editor-header 专栏
  div(v-if="!state.userColumn")
      h5(v-if="state.columnPermission") 你还未开设专栏。
        a(href=`/column/apply` target="_blank") 立即开设
      h5(v-else) 目前还不能开设专栏，通常是因为你参与讨论较少或没有文章被列入精选。
  div(v-else)
    div(v-if="!data.addedToColumn") 
      .moduleSelectColumnCategories(
      :data-column-id="state.column._id"
      :data-to-column='data.toColumn?"true":""'
      v-cloak)
      .checkbox
        label
          input(type='checkbox' :value="true" v-model="choose")
          | 同时转发文章到专栏
      .row(v-if="choose.length > 0")
        .col-xs-6
          div(style="background-color: #eee;padding: 0.5rem;")
            .text-center(v-if="!loaded") 加载中...
            div(v-else)
              .category-type 主分类
              .checkbox(v-for="(c, index) in mainCategories" :class="{'m-t-0':index===0}")
                label
                  span(v-html="c.str")
                  input(type="checkbox" :value="c._id" v-model="selectedMainCategoriesId")
                  span {{c.name}}
              .category-type 辅分类
              .checkbox(v-for="(c, index) in minorCategories" :class="{'m-t-0':index===0}")
                label
                  span(v-html="c.str")
                  input(type="checkbox" :value="c._id" v-model="selectedMinorCategoriesId")
                  span {{c.name}}
            .m-t-05
              button.btn.btn-default.btn-sm.fa.fa-plus-circle(@click="addCategory" v-if="!createCategory") &nbsp;
                |添加分类
              .form(v-if="createCategory").m-t-1
                .form-group
                  label 分类类型
                  .radio
                    label.m-r-1
                      input(type='radio' value="main" v-model='newCategory.type')
                      span 主分类
                    label
                      input(type='radio' value='minor' v-model='newCategory.type')
                      span 辅分类
                .form-group
                  label 分类名（不超过20字符）
                  input.form-control(type="text" v-model.trim="newCategory.name")
                .form-group
                  label 分类简介（不超过100字符）
                  textarea.form-control(v-model.trim="newCategory.description" rows=3)
                .form-group(v-if='newCategory.type === "main"')
                  label 父级分类
                  select.form-control(v-model="newCategory.parentId")
                    option(value="") 无
                    option(v-for="c in mainCategories" :value="c._id" v-html="c.str + c.name")
                .form-group
                  h5.text-danger(v-if="error") {{error}}
                  button.btn.btn-primary.btn-sm(@click="saveCategory") 保存
                  button.btn.btn-default.btn-sm(@click="cancelAddCategory") 取消
    h5(v-else) 本文已经发表到专栏，如需从专栏撤稿，请到专栏管理界面操作。
</template>

<script>
export default {
  data: () => ({
    loaded: false,
    choose: [],
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
      type: "main"
    }
  }),
  props: {
    state: {
      type: Object,
      required: true
    },
    data: {
      type: Object,
      required: true
    }
  },
  created() {
    this.choose = this.data.toColumn ? [true] : [];
    this.columnId = this.state.column?._id || "";
  },
  mounted: function() {
    if (this.choose.length) {
      this.getCategories();
    }
  },
  watch: {
    data(n, o) {
      this.choose = n.toColumn ? [true] : [];
    },
    state(n, o) {
      this.columnId = n.column?._id || "";
    }
  },
  methods: {
    getStatus() {
      return {
        selectedMainCategories: this.selectedMainCategories,
        selectedMainCategoriesId: this.selectedMainCategoriesId,
        selectedMinorCategories: this.selectedMinorCategories,
        selectedMinorCategoriesId: this.selectedMinorCategoriesId,
        checkbox: this.choose.length > 0
      };
    },
    getMainCategoryById: function(_id) {
      for (var i = 0; i < this.mainCategories.length; i++) {
        if (this.mainCategories[i]._id === _id) return this.mainCategories[i];
      }
    },
    getMinorCategoryById: function(_id) {
      for (var i = 0; i < this.minorCategories.length; i++) {
        if (this.minorCategories[i]._id === _id) return this.minorCategories[i];
      }
    },
    getCategories: function() {
      nkcAPI("/m/" + this.columnId + "/category?from=fastPost", "GET")
        .then(data => {
          this.loaded = true;
          for (var i = 0; i < data.mainCategories.length; i++) {
            var c = data.mainCategories[i];
            var str = "";
            for (var j = 0; j < c.level; j++) {
              str += "&nbsp;&nbsp;&nbsp;";
            }
            c.str = str;
          }
          this.mainCategories = data.mainCategories;
          this.minorCategories = data.minorCategories;
        })
        .catch(function(data) {
          this.loaded = true;
          sweetError(data);
        });
    },
    saveCategory: function() {
      var app = this;
      this.error = "";
      var category = this.newCategory;
      if (!category.type) return (this.error = "请选择分类类型");
      if (!category.name) return (this.error = "请输入分类名");
      if (!category.description) return (this.error = "请输入分类介绍");
      nkcAPI("/m/" + this.columnId + "/category", "POST", category)
        .then(function() {
          app.getCategories();
          app.createCategory = false;
          app.newCategory = {
            name: "",
            description: "",
            parentId: "",
            type: "main"
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
    getData() {
      const status = this.getStatus();
      if (status.checkbox) {
        return {
          columnMainCategoriesId: status.selectedMainCategoriesId || [],
          columnMinorCategoriesId: status.selectedMinorCategoriesId || []
        };
      }
    }
  },
  computed: {
    selectedMainCategories: function() {
      var arr = [];
      for (var i = 0; i < this.selectedMainCategoriesId.length; i++) {
        var c = this.getMainCategoryById(this.selectedMainCategoriesId[i]);
        if (c) arr.push(c);
      }
      return arr;
    },
    selectedMinorCategories: function() {
      var arr = [];
      for (var i = 0; i < this.selectedMinorCategoriesId.length; i++) {
        var c = this.getMinorCategoryById(this.selectedMinorCategoriesId[i]);
        if (c) arr.push(c);
      }
      return arr;
    }
  },
  watch: {
    choose: function() {
      if (this.choose.length > 0 && this.mainCategories.length === 0) {
        this.getCategories();
      } else {
        this.loaded = false;
        this.mainCategories = [];
        this.selectedMainCategoriesId = [];
        this.minorCategories = [];
        this.selectedMinorCategoriesId = [];
      }
    }
  }
};
</script>

<style scoped>
.moduleSelectColumnCategories .category-type {
  background-color: #d0d0d0;
  border-left: 6px solid #555;
  padding-left: 0.5rem;
  font-weight: 700;
  height: 2rem;
  line-height: 2rem;
}
.editor-header {
  font-size: 1.25rem;
  margin: 0.3rem 0;
  color: #555;
  font-weight: 700;
}
.editor-header small {
  color: #88919d;
}
</style>
