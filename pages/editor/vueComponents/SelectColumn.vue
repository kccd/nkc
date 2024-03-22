<template lang="pug">
  .modal-content(ref="searchColumn" v-if="show")
    .modal-header
      .modal-title.text-left(ref="header") 选择专栏
      .modal-close(@click="close")
        .fa.fa-remove
    .modal-body
      .selected-users
        h5 已选择专栏：
          span(v-if="selectedColumn.length===0") 无
        .selected-column(v-for="column,index in selectedColumn" :key="index")
          .selected-column-avatar
            img(:src="getUrl('userAvatar', column.avatar)")
          .selected-column-name {{column.name}}
            .fa.fa-remove(@click="(removeColumn(index))")
      .row(v-if="selectedColumn.length>0&&showColumnCategories")
        .col-xs-12.col-md-12
          .form
            .form-group.m-t-2
              h5
                b 选择文章分类
              .row
                .col-xs-12.col-md-6
                  strong.category-type 主分类
                  .checkbox(v-for="c in mainCategories")
                    label
                      span(v-for="index in c.level") &nbsp;&nbsp;&nbsp;&nbsp;
                      input(type="checkbox" :value="c._id" v-model="mainCategoriesId")
                      span {{c.name}}
                .col-xs-12.col-md-6
                  strong.category-type 辅分类
                  .checkbox(v-for="c in minorCategories")
                    label
                      span(v-for="index in c.level") &nbsp;&nbsp;&nbsp;&nbsp;
                      input(type="checkbox" :value="c._id" v-model="minorCategoriesId")
                      span {{c.name}}
      .input-group(v-if="!isRetreatColum")
        .input-group-btn
          button.btn.btn-default.dropdown-toggle(aria-expanded=false)
            | {{getTypeName('columnName')}}&nbsp;
            span.caret
          ul.dropdown-menu
            li.pointer
              a(@click="selectType('columnName')") {{getTypeName("columnName")}}
            li.pointer
              a(@click="selectType('columnId')") {{getTypeName("columnId")}}
        input.form-control.search-input(type="text" v-model.trim="keyword" @keyup.enter="search")
        button.search-button(@click="search")
          .fa.fa-search
      .search-results
        h5.text-danger(v-if="searchColumns&&searchColumns.length===0") 未找到相关专栏
        h5(v-if="isRetreatColum") 已投稿的专栏:
        .search-column(v-for="column,index in searchColumns||[]" :key="index" @click="clickColumn(column)")
          .search-user-avatar
            img(:src="getUrl('userAvatar', column.avatar)")
          .search-user-info
            .search-user-name {{column.name}}
            .search-user-description {{ column.abbr }}
          .search-column-status(v-if=" column.type==='retreat'&&column.passed==='pending' " :style="'border-right-color: #d9ecff;'") 
            span(:style="'color: #409eff;'") 审核中
          .search-column-status(v-if=" column.type==='retreat'&&column.passed==='reject' " :style="'border-right-color: #fde2e2;'") 
            span(:style="'color: #f56c6c;'") 撤稿失败
          

    .modal-footer
      button(type="button" class="btn btn-default btn-sm" @click="close") 关闭
      button(type="button" class="btn btn-primary btn-sm" disabled=true v-if="!selectedColumn.length") 确定
      button(type="button" class="btn btn-primary btn-sm" @click="done" v-else) 确定
</template>
<script>
import { getColumnMessage } from '../../lib/js/column';
import { DraggableElement } from "../../lib/js/draggable";

export default {
  data:()=> ({
      searchColumns: undefined,
      type: "columnName",
      keyword: "",
      show:false,
      showColumnCategories:false,
      selectedColumn:[],
      mainCategories:[],
      minorCategories:[],
      mainCategoriesId:[],
      minorCategoriesId:[],
      isRetreatColum:false,
    }),
    computed: {
    },
    watch: {
      'selectedColumn':{
        immediate: false,
        handler(newValue,oldValue){
          if(this.showColumnCategories&&newValue.length>0){
            this.getCategories();
          }
        }
      },
    },
    methods: {
      checkString: NKC.methods.checkData.checkString,
      getUrl: NKC.methods.tools.getUrl,
      removeColumn: function(index) {
        this.selectedColumn.splice(index, 1);
        
      },
      clickColumn(column) {
        if(this.isRetreatColum){
          if(this.selectedColumn.findIndex(item=>item._id===column._id)===-1){
            this.selectedColumn.push({...column});
          }
        }else{
          this.selectedColumn=[{...column}];
        }
        
      },
      search() {
        this.checkString(this.keyword, {
          name: "输入的关键词",
          minLength: 1
        });
        const self = this;
      getColumnMessage(this.keyword).then(res=>{
          self.searchColumns = [...res];
        })
      },
      getCategories() {
        const self = this;
        nkcAPI("/m/" + self.selectedColumn[0]._id + "/category?from=fastPost", "GET")
          .then(function(data) {
            self.mainCategories = data.mainCategories;
            self.minorCategories = data.minorCategories;
          })
          .catch(function(data) {
            sweetError(data);
          });
      },
      getTypeName: function(type) {
        return {
          "columnId": "专栏ID",
          "columnName": "专栏名"
        }[type];
      },
      getColumnData(){
        // 获取已经投稿的专栏数据
      },
      selectType: function(type) {
        this.type = type;
      },
      open: function(callback, options) {
        const {showColumnCategories,retreatArticle} = options;
        this.showColumnCategories = showColumnCategories;
        if(retreatArticle){
          this.searchColumns = [...retreatArticle.column];
          this.isRetreatColum = true;
        }
        this.callback = callback;
        this.show = true;
        this.$nextTick(()=>{
          this.draggableElement = new DraggableElement(
            this.$refs.searchColumn,
            this.$refs.header
          );
          this.draggableElement.setPositionCenter()

        })
      },
      close: function() {
        this.show = false;
        // setTimeout( ()=> {
          this.searchColumns = undefined;
          this.selectedColumn = [];
          this.showColumnCategories = false;
          this.isRetreatColum = false;
          this.keyword = '';
          this.mainCategories = [],
          this.minorCategories = [],
          this.mainCategoriesId = [],
          this.minorCategoriesId = [],
        // }, 1000);
        this.draggableElement && this.draggableElement.destroy();
      },
      done: function() {
        this.callback({
          columns: [...this.selectedColumn],
          mainCategoriesId:[...this.mainCategoriesId],
          minorCategoriesId:[...this.minorCategoriesId]
        });
        this.close();
      }
    }
}
</script>
<style scoped lang="less">
@media (min-width: 768px){
.modal-dialog{
  width: 400px;
}
}
.modal-title{
  padding-left: 5px;
  height: 3rem;
  line-height: 3rem;
}
.modal-close{
  cursor: pointer;
  color: #aaa;
  width: 3rem;
  position: absolute;
  top: 0;
  right: 0;
  height: 3rem;
  line-height: 3rem;
  text-align: center;
  &:hover{
    background-color: rgba(0,0,0,0.08);
    color: #777;
  }
}
.text-left{
  text-align: left;
}
.modal-content{
  position: fixed;
  top: 20%;
  width: 30rem;
}
.modal-header{
  font-weight: 700;
  padding: 0;
  height: 3rem;
  color: #000;
  cursor: all-scroll;
  user-select: none;
  background-color: #f6f6f6;
  border-bottom: none;
}
.modal-body{
  padding-top: 0;
  padding-bottom: 0;
}
.modal-footer{
  border-top: none;
}

.search-button{
  position: absolute;
  top: 0;
  right: 0;
  height: 34px;
  width: 34px;
  z-index: 100;
  border: none;
  background-color: rgba(255, 255, 255, 0);
  color: #282c37;
}
.search-input{
  padding-right: 34px;
  border-radius: 0 4px 4px 0;
  border-left: none;
}
.search-column{
  cursor: pointer;
  margin: 0.5rem 0;
  height: 4rem;
  padding: 0.5rem;
  background-color: #f4f4f4;
  position: relative;
  .search-column-status{
    width: 0;
    height: 0;
    border-bottom: 4rem solid transparent;
    border-right: 5rem solid;
    position: absolute;
    top: 0;
    right: 0;
    span{
      position: absolute;
      top: 1.5rem;
      right: -7.4rem;
      transform: translate(-50%, -50%) rotate(40deg);
      font-size: 0.9rem;
      width: 4rem;
      text-align: center;
    }
  }
}
.search-user-avatar img{
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 3px;
}
.search-user-avatar{
  display: table-cell;
  width: 3.5rem;
}
.search-user-info{
  display: table-cell;
  vertical-align: top;
  padding-left: 1rem;
}
.search-user-name{
  height: 1.5rem;
  font-size: 1.3rem;
  font-weight: 700;
  /*padding-right: 3rem;*/
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
  position: relative;
}
.search-user-name .button{
  font-size: 1.4rem;
  color: #2b90d9;
  position: absolute;
  top: 0;
  right: 0;
  height: 1.5rem;
  width: 2rem;
}
.search-user-description{
  margin-top: 0.5rem;
  height: 1.5rem;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  font-size: 1rem;
  overflow: hidden;
}
.selected-users{
  padding: 0.5rem 0;
}
.selected-column{
  font-size: 0;
  display: inline-block;
  margin: 0 0.5rem 0.5rem 0;
  vertical-align: top;
}
.selected-column-avatar img{
  height: 2.5rem;
  width: 2.5rem;
  border-radius: 3px 0 0 3px;
}
.selected-column-avatar{
  display: inline-block;
  vertical-align: top;
}
.selected-column-name{
  vertical-align: top;
  display: inline-block;
  height: 2.5rem;
  line-height: 2.5rem;
  padding: 0 0.5rem;
  border-radius: 0 3px 3px 0;
  font-size: 1.2rem;
  background-color: #999;
  color: #fff;
}
.selected-column-name .fa{
  cursor: pointer;
}
</style>
