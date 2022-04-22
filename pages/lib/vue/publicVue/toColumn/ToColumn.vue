<template lang="pug">
  .module-dialog-body
    .module-dialog-header(ref="draggableHandle")
      .module-dialog-title 选择分类
      .module-dialog-close(@click="close")
        .fa.fa-remove
    .module-dialog-content
      .text-center.m-t-3.m-b-3(v-if="loading") 加载中...
      div(v-else)
        div(v-if="!createCategory")
          div(v-if='showOperationType')
            .category-type 操作类型
            .radio
              label
                input(type='radio' value='add' v-model='operationType')
                span 添加分类（不影响已有分类）
            .radio
              label
                input(type='radio' value='replace' v-model='operationType')
                span 替换已有分类
          div(v-if='showCategoryType')
            .category-type 作用范围
            .radio
              label.m-r-1
                input(type='radio' value='all' v-model='categoryType')
                span 全部
              label.m-r-1
                input(type='radio' value='main' v-model='categoryType')
                span 仅主分类
              label
                input(type='radio' value='minor' v-model='categoryType')
                span 仅辅分类
          div(v-if='categoryType !== "minor"')
            .category-type 主分类
            .radio(v-if="!selectMul" v-for="c in mainCategories")
              label(v-if="excludes.indexOf(c._id) === -1")
                span(v-html="c.str")
                input(type="radio" :value="c._id" v-model="mainCategoryId")
                span {{c.name}}
            .checkbox(v-else)
              label(v-if="excludes.indexOf(c._id) === -1")
                span(v-html="c.str")
                input(type="checkbox" :value="c._id" v-model="mainCategoriesId")
                span {{c.name}}
          div(v-if='categoryType !== "main"')
            .category-type 辅分类
            .radio(v-if="!selectMul" v-for="c in minorCategories")
              label(v-if="excludes.indexOf(c._id) === -1")
                span(v-html="c.str")
                input(type="radio" :value="c._id" v-model="minorCategoryId")
                span {{c.name}}
            .checkbox(v-else)
              label(v-if="excludes.indexOf(c._id) === -1")
                span(v-html="c.str")
                input(type="checkbox" :value="c._id" v-model="minorCategoriesId")
                span {{c.name}}
          .text-center
            .pointer(@click="addCategory").m-t-2.m-b-05
              .fa.fa-plus-circle &nbsp;添加分类
        .m-t-1(v-else)
          .form(v-if="createCategory")
            .form-group
              label 分类类型
              .radio
                label.m-r-1
                  input(type='radio' value='main' v-model='newCategory.type')
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
              .text-right
                button.btn.btn-default.btn-sm(@click="cancelAddCategory") 取消
                button.btn.btn-primary.btn-sm(@click="saveCategory") 保存
        .m-t-1.m-b-1.text-right(v-if="!createCategory")
          button(type="button" class="btn btn-sm btn-default" data-dismiss="modal") 取消
          button(type="button" class="btn btn-sm btn-primary" @click="complete") 确定
</template>
<style lang="less">
@import "../../../../publicModules/base";
.module-dialog-body {
  display: none;
  position: fixed;
  width: 30rem;
  max-width: 100%;
  top: 100px;
  right: 0;
  z-index: 1050;
  background-color: #fff;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
  border: 1px solid #ddd;
  margin: 1rem;

  .module-dialog-header {
    height: 3rem;
    line-height: 3rem;
    background-color: #f6f6f6;

    .module-dialog-close {
      cursor: pointer;
      color: #aaa;
      width: 3rem;
      position: absolute;
      top: 0;
      right: 0;
      height: 3rem;
      line-height: 3rem;
      text-align: center;

      &:hover {
        background-color: rgba(0, 0, 0, 0.08);
        color: #777;
      }
    }

    .module-dialog-title {
      cursor: move;
      font-weight: 700;
      margin-left: 1rem;
    }
  }

  .module-dialog-content {
    padding: 0 1rem;
    .category-type{
      border-left: 6px solid #555;
      padding-left: 0.5rem;
      background-color: #f4f4f4;
      font-weight: 700;
      height: 2rem;
      line-height: 2rem;
    }
  }
}
</style>
<script>
import {DraggableElement} from "../../../js/draggable";
import {getColumnInfo} from "../../../js/column";
export default  {
  data: () => ({
    show: false,
    uid: NKC.configs.uid,
    selectMul: false,
    columnId: null,
    mainCategories: [],
    minorCategories: [],
    exclude: [],
    category: "",
    column: "",
    loading: true,
    mainCategoryId: "",
    minorCategoryId: '',

    categoryType: 'all', // main: 主分类, minor: 辅分类, all: 全部
    showOperationType: false,
    showCategoryType: false,

    mainCategoriesId: [],
    minorCategoriesId: [],

    operationType: 'add', // add: 添加，不影响现有分类 replace: 替换原有分类

    createCategory: false,

    newCategory: {
      parentId: "",
      name: "",
      description: "",
      type: 'main' // main, minor
    },

    info: "",
    error: "",
    callback: null, //回调
  }),
  mounted() {
    this.initDraggableElement();
    getColumnInfo()
    .then(res => {
      this.columnId = res.userColumn._id;
    })
  },
  destroyed(){
    this.draggableElement && this.draggableElement.destroy();
  },
  computed: {
    excludes: function() {
      const this_ = this;
      const exclude = this.exclude;
      let arr = [].concat(exclude);
      const func = function(ids) {
        for(let i = 0; i < ids.length; i++) {
          const id = ids[i];
          const childrenId = this_.getChildren(id);
          arr = arr.concat(childrenId);
          func(childrenId);
        }
      };
      func(exclude);
      return arr;
    },
  },
  methods: {
    initDraggableElement() {
      this.draggableElement = new DraggableElement(this.$el, this.$refs.draggableHandle);
      this.draggableElement.setPositionCenter();
    },
    //关闭弹窗
    close() {
      this.draggableElement.hide();
      this.show = false;
      const self = this;
      setTimeout(function() {
        self.hide();
      }, 500);
    },
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
    //打开分类选择
    open(callback, options) {
      if(callback) this.callback = callback;
      if(options) {
        this.exclude = options.exclude || [];
        this.selectMul = options.selectMul || false;
        this.mainCategoriesId = options.selectedMainCategoriesId || options.selectedCid || [];
        this.minorCategoriesId = options.selectedMinorCategoriesId || [];
        this.showOperationType = options.showOperationType || false;
        this.showCategoryType = options.showCategoryType || false;
      };
      this.draggableElement.show();
      this.show = true;
      this.getCategories();
    },
    hide() {
      this.mainCategoryId = "";
      this.minorCategoryId = '';
      this.minorCategoriesId = [];
      this.mainCategoriesId = [];
    },
    complete() {
      if(!this.columnId || !this.uid) return screenTopWarning("数据加载中，请稍后重试");
      this.callback({
        mainCategoryId: this.mainCategoryId,
        minorCategoryId: this.minorCategoryId,
        columnId: this.columnId,
        uid: this.uid,
        mainCategoriesId: this.mainCategoriesId,
        minorCategoriesId: this.minorCategoriesId,
        operationType: this.operationType,
        categoryType: this.categoryType
      });
    }
  }
}
</script>
