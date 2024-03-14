<template lang="pug">
  .modal-content(ref="submitColumn" v-if="show")
    .modal-header
      .modal-title.text-left(ref="submitHeader") 投稿管理
      .modal-close(@click="close")
        .fa.fa-remove
    .modal-body
      .modal-tab
        ul.nav.nav-tabs
          li(v-for="tab,index in tabItems" :class="{'active': tab.name === currentTab.name}" :key="index" @click="currentTab=tab;" style='cursor:pointer;')
            a {{tab.title}}
      .selected-users(v-if=" currentTab.name==='contribute' ")
      .input-group(v-if="currentTab.name==='contribute' ")
        .input-group-btn
          button.btn.btn-default.dropdown-toggle(aria-expanded=false)
            | {{getTypeName('columnName')}}&nbsp;
            span.caret
          ul.dropdown-menu
            li.pointer
              a(@click="selectType('columnName')") {{getTypeName("columnName")}}
            //li.pointer
              a(@click="selectType('columnId')") {{getTypeName("columnId")}}
        input.form-control.search-input(type="text" v-model.trim="keyword" @keyup.enter="search")
        button.search-button(@click="search")
          .fa.fa-search
      .search-results(v-if= "currentTab.name==='contribute' ")
        h5.text-danger(v-if="searchColumns&&searchColumns.length===0") 未找到相关专栏
        .search-column(v-for="column,index in searchColumns||[]" :key="index" :style=" 'cursor:pointer;' " @click="clickColumn(column)")
          .search-user-avatar
            img(:src="getUrl('userAvatar', column.avatar)")
          .search-user-info
            .search-user-name {{column.name}}
            .search-user-description {{ column.abbr }}
      .contributed-results(v-if= "currentTab.name==='contributed' ")
        h5.p-t-2.text-center(v-if="!submittedColumn||submittedColumn.length===0") 空空如也~
        .search-column(v-for="column,index in submittedColumn||[]" :key="index" style="height:7rem")
          .search-user-avatar
            img(:src="getUrl('userAvatar', column.avatar)")
          .search-user-info
            a.search-user-name( :href="`/m/${column._id}`"  target='_blank') {{column.name}}
            .search-user-description {{ column.abbr }}
          //.search-colum-button
              button.cancel(v-if=" column.type==='retreat'&&column.passed==='pending' " @click="cancelRetreat(index)") 取消
              button.confirm(v-else @click="retreatContribute(index)") 撤稿
          .search-column-status(v-if=" column.type==='retreat'&&column.passed==='pending' " :style="'border-left-color: rgba(217, 236, 255,0.85);'") 
            span(:style="'color: #409eff;'") 审核中
          //.search-column-status(v-if=" column.type==='retreat'&&column.passed==='reject' " :style="'border-left-color: rgba(253, 226, 226,0.85);'") 
            span(:style="'color: #f56c6c;'") 撤稿失败
          .search-colum-button.m-t-05
            a.m-r-05( :href="column.inColumnUrl"  target='_blank') 在专栏中查看
            button.cancel(v-if=" column.type==='retreat'&&column.passed==='pending' " @click="cancelRetreat(index)") 取消专栏撤稿
            button.confirm(v-else @click="retreatContribute(index)") 从专栏中撤稿
      .contributing-results(v-if= "currentTab.name==='contributing' ")
        h5.p-t-2.text-center(v-if="!submittingColumn||submittingColumn.length===0") 空空如也~
        .search-column(v-for="column,index in submittingColumn||[]" :key="index" style="height:7rem")
          .search-user-avatar
            img(:src="getUrl('userAvatar', column.avatar)")
          .search-user-info
            a.search-user-name(:href="`/m/${column._id}`"  target='_blank') {{column.name}}
            .search-user-description {{ column.abbr }}
          .search-colum-button.m-t-05
              button.cancel(@click="cancelSubmit(index)") 取消专栏投稿
          .search-column-status(:style="'border-left-color: rgba(217, 236, 255,0.85);'") 
            span(:style="'color: #409eff;'") 审核中
      .row(v-if="selectedColumn.length>0&&currentTab.name==='contribute' ")
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
    .modal-footer
      button(type="button" class="btn btn-default btn-sm" @click="close") 关闭
      button(type="button" class="btn btn-primary btn-sm" @click="done" v-if="currentTab.name==='contribute' && selectedColumn.length>0  ") 投稿
      button(type="button" class="btn btn-primary btn-sm" @click="done" disabled v-if="currentTab.name==='contribute' && selectedColumn.length===0 ") 投稿
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
      selectedColumn:[],
      submittedColumn:[],
      submittingColumn:[],
      mainCategories:[],
      minorCategories:[],
      mainCategoriesId:[],
      minorCategoriesId:[],
      tabItems:[{name:'contribute',title:'投稿'},{name:'contributed',title:'已投稿'},{name:'contributing',title:'投稿中'}],
      currentTab:{name:'contribute',title:'投稿'}
    }),
    computed: {
    },
    watch: {
      'selectedColumn':{
        immediate: false,
        handler(newValue,oldValue){
          if(newValue.length>0){
            this.getCategories();
          }
        }
      },
      // currentTab:{
      //   immediate: false,
      //   handler(newValue,oldValue){
      //     console.log('====================================');
      //     console.log(newValue);
      //     console.log('====================================');
      //   }
      // },
    },
    methods: {
      checkString: NKC.methods.checkData.checkString,
      getUrl: NKC.methods.tools.getUrl,
      removeColumn: function(index) {
        this.selectedColumn.splice(index, 1);
        
      },
      clickColumn(column) {
        const { inColumn,inContribute} =column;
        if(inColumn){
          sweetError('该专栏已投稿');
          return;
        }
        if(inContribute) {
          sweetError('该专栏已发送投稿申请');
          return;
        }
        this.selectedColumn=[{...column}];
      },
      search() {
        this.mainCategories = [];
        this.minorCategories = [];
        this.selectedColumn = [];
        this.checkString(this.keyword, {
          name: "输入的关键词",
          minLength: 1
        });
        const self = this;
      getColumnMessage(this.keyword,this.articleId).then(res=>{
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
        const {retreatArticle,articleId,currentTab} = options;
        if(retreatArticle){
          this.submittedColumn = [...retreatArticle.column];
          this.submittingColumn = [...retreatArticle.contributeColumns];
          this.articleId = articleId;
        }
        if(currentTab){
          this.currentTab = {...currentTab}; 
        }
        this.callback = callback;
        this.show = true;
        this.$nextTick(()=>{
          this.draggableElement = new DraggableElement(
            this.$refs.submitColumn,
            this.$refs.submitHeader
          );
          this.draggableElement.setPositionCenter()

        })
      },
      close: function() {
        if(!this.show) return;
        this.show = false;
        // setTimeout( ()=> {
          this.searchColumns = undefined;
          this.submittedColumn = [];
          this.selectedColumn = [];
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
      },
      retreatContribute: function(index){
        const articlesId = this.articleId;
        const column = this.submittedColumn[index];
        const self = this;
        sweetQuestion('确定要从当前专栏撤稿吗？此操作需要经专栏管理员同意后才可生效。').then(function() {
          nkcAPI("/api/v1/articles/contribute", "POST", {
                      articlesId,
                      columns:[column._id],
                      threadsId:[],
                      description:'',
                      type:'retreat',
                      passed:'pending'

                    })
                      .then(function(data) {
                        const {passed} =data.data;
                        if(passed){
                          if(passed==='pending'){
                            column.passed = 'pending';
                            column.type = 'retreat';
                            sweetSuccess('发送撤稿申请成功');
                          }else if(passed==='resolve'){
                            self.deleteOneColumn(index);
                            sweetSuccess('撤稿成功');
                          }
                        }
                      })
                      .catch(err=>{
                        sweetError(err);
                      });
        });
      },
      cancelRetreat: function(index){
        const articlesId = this.articleId;
        const column = this.submittedColumn[index];
        const self = this;
        sweetConfirm('确定要取消撤稿申请吗？').then(function() {
          nkcAPI("/api/v1/articles/contribute", "POST", {
                      articlesId,
                      columns:[column._id],
                      threadsId:[],
                      description:'',
                      type:'retreat',
                      passed:'cancel'
                    })
                      .then(function(data) {
                        const {passed} =data.data;
                        if(passed&&passed==='cancel'){
                          column.passed = passed;
                          self.$emit('change-column',[...self.submittedColumn]);
                          sweetSuccess('取消成功');
                        }
                      })
                      .catch(err=>{
                        sweetError(err);
                      });
        });
      },
      cancelSubmit: function(index){
        const articlesId = this.articleId;
        const column = this.submittingColumn[index];
        const temColumns = [...this.submittingColumn];
        const self = this;
        sweetConfirm('确定要取消投稿申请吗？').then(function() {
          nkcAPI("/api/v1/articles/contribute", "POST", {
                      articlesId,
                      columns:[column._id],
                      threadsId:[],
                      description:'',
                      type:'submit',
                      passed:'cancel'
                    })
                      .then(function(data) {
                        const {passed} =data.data;
                        if(passed&&passed==='cancel'){
                          temColumns.splice(index,1);
                          self.submittingColumn = temColumns;
                          self.$emit('change-column',{contributeColumns:temColumns});
                          sweetSuccess('取消成功');
                        }
                      })
                      .catch(err=>{
                        sweetError(err);
                      });
        });
      },
      deleteOneColumn: function(index){
        if(!this.submittedColumn||this.submittedColumn.length===0){
          return;
        }
        const tempSearchColumns = [...this.submittedColumn];
        tempSearchColumns.splice(index,1);
        this.submittedColumn =[...tempSearchColumns];
        this.$emit('change-column',{column:tempSearchColumns});
      },
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
  padding-left: 1rem;
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
  padding-top: 1rem;
  padding-bottom: 0;
  max-height: 60vh;
  overflow-y: auto;
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
  // cursor: pointer;
  margin: 0.5rem 0;
  height: 4.5rem;
  padding: 0.5rem;
  background-color: #f4f4f4;
  position: relative;
  .search-column-status{
    width: 0;
    height: 0;
    border-bottom: 4rem solid transparent;
    border-left: 5rem solid;
    position: absolute;
    top: 0;
    left: 0;
    span{
      position: absolute;
      top: 1.5rem;
      left: -3rem;
      transform: translate(-50%, -50%) rotate(320deg);
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
  // max-width: 19rem;
}
.search-colum-button{
  // position: absolute;
  // right: 0.5rem;
  // top: 2rem;
  float: right;
  button{
    height: 2rem;
    width: 8rem;
    border-radius: 2px;
    box-shadow: 1px 1px 6px rgba(0, 0, 0, 0.2);
    font-size: 1rem;
  }
  .confirm{
    background-color: #fff;
    border: 1px solid #ccc;
    color: #282c37;
  }
  .cancel{
    background-color: #e85a71;
    border: 1px solid #e85a71;
    color: #fff;
  }
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
  padding-top: 0.5rem;
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
