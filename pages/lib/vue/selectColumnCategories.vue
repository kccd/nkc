<template lang="pug">
  #moduleSelectColumnCategories
    .row.clear-marginR
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
                textarea.form-control(v-model.trim="newCategory.brief" rows=3)
              .form-group(v-if='newCategory.type === "main"')
                label 父级分类
                select.form-control(v-model="newCategory.parentId")
                  option(value="") 无
                  option(v-for="c in mainCategories" :value="c._id" v-html="c.str + c.name")
              .form-group
                h5.text-danger(v-if="error") {{error}}
                button.btn.btn-primary.btn-sm(@click="saveCategory") 保存
                button.btn.btn-default.btn-sm(@click="cancelAddCategory") 取消
</template>

<style lang="less">
@import '../../publicModules/base';
#moduleSelectColumnCategories .category-type{
  background-color: #d0d0d0;
  border-left: 6px solid #555;
  padding-left: 0.5rem;
  font-weight: 700;
  height: 2rem;
  line-height: 2rem;
}
</style>

<script>
import {getRequest} from "../js/tools";
export default {
  props: ['column-id'],
  data: () => ({
    loaded: false,
    mainCategories: [],
    minorCategories: [],
    selectedMainCategoriesId: [],
    selectedMinorCategoriesId: [],
    error: "",
    createCategory: false,
    newCategory: {
      parentId: "",
      name: "",
      brief: "",
      description: "",
      type: 'main'
    },
  }),
  mounted() {
    this.getCategories();
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
    selectedMainCategoriesId() {
      this.$emit('change');
    },
    selectedMinorCategoriesId() {
      this.$emit('change');
    }
  },
  methods: {
    getRequest: getRequest,
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
      const self = this;
      nkcAPI("/m/" + self.columnId + "/category?from=fastPost", "GET")
        .then(function(data) {
          self.loaded = true;
          for(var i = 0; i < data.mainCategories.length; i++) {
            var c = data.mainCategories[i];
            var str = "";
            for(var j = 0; j < c.level; j++) {
              str += "&nbsp;&nbsp;&nbsp;";
            }
            c.str = str;
          }
          self.mainCategories = data.mainCategories;
          self.minorCategories = data.minorCategories;
        })
        .catch(function(data) {
          self.loaded = true;
          sweetError(data);
        });
    },
    saveCategory: function() {
      if(!this.columnId) return;
      var app = this;
      this.error = "";
      var category = this.newCategory;
      if(!category.type) return this.error = "请选择分类类型";
      if(!category.name) return this.error = "请输入分类名";
      if(!category.brief) return this.error = "请输入分类简介";
      nkcAPI("/m/" + this.columnId + "/category", "POST", category)
        .then(function() {
          app.getCategories();
          app.createCategory = false;
          app.newCategory = {
            name: "",
            description: "",
            brief: "",
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
    //获取文章专栏分类
    getStatus() {
      return {
        selectedMainCategories: this.selectedMainCategories,
        selectedMainCategoriesId: this.selectedMainCategoriesId,
        selectedMinorCategories: this.selectedMinorCategories,
        selectedMinorCategoriesId: this.selectedMinorCategoriesId,
      }
    }
  }
}
</script>
