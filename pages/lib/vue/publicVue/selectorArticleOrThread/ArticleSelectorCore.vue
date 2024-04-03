<template lang="pug">
  .selector-core
    .selector-core-header
      .selected-table.paging-button
        a.selected-table-span.button.radius-left(
          @click.stop='selectSource("threads")'
          :class="{active : selectedSource === 'threads'}"
        ) {{source.thread}}
        a.selected-table-span.button(
          v-if="articleSource && articleSource.includes('zone')"
          @click.stop='selectSource("zone")'
          :class="{active : selectedSource === 'zone', 'radius-right': articleSource && !articleSource.includes('column')}"
        ) {{source.zone}}
        a.selected-table-span.button.radius-right(
          v-if="articleSource && articleSource.includes('column')"
          @click.stop='selectSource("column")'
          :class="{active : selectedSource === 'column'}"
        ) {{source.column}}
        a.selected-table-span.button.m-l-1.relative(
          @click.stop='selectSource("choose")'
          :class="{active : selectedSource === 'choose', 'radius-left': true, 'radius-right': true}"
        ) 已选泽
          .selected-count.absolute(v-if="getSelectedArticles.length !== 0") {{getSelectedArticles.length}}
        .selected-search.m-t-05
          input.inline-block.form-control.search-input(type="text" v-model.trim="keyword" @keyup.enter="search" placeholder='文章标题、文号')
          button.btn.btn-default.search-button(@click="search")
            .fa.fa-search
          button.btn.btn-default.m-l-05.search-clear(@click="clear") 清空
    div
      div.selector-core-body(v-if="loading" ) 加载中...
      div(v-else)
        .selector-core-body(v-if="selectedSource !== 'choose'" )
          paging(ref="paging" :pages="pageButtons" @click-button="clickButton" v-if="!searchStatus")
          .text-warning.m-b-05(v-else) 根据关键词“{{ searchKeyword}}”约找到 {{ articles.length }} 条结果，未找到文章还请输入完整标题或文号
          label
              input(type='checkbox' :checked='isAllChecked' @click="selectedAllArticlesFunc()")
              div.content-position(style="cursor:pointer;") 全选
          .articles
            .text-center.p-t-3.p-b-1(v-if="articles.length === 0") 空空如也~
            label(v-for="article in articles")
              input(type='checkbox' :value='article.tid' v-model='selectedArticlesId' @click="selectedArticlesFunc(article)")
              div.content-position
                a.title(:href="article.url" target="_blank") {{article.t}}
                div.content
                  span.toc(:title="detailedTime(article.toc)") {{fromNow(article.toc)}}
                  span {{article.c}}
        .selector-core-body(v-else)
          .articles
            .text-center.p-t-3.p-b-1(v-if="getSelectedArticles.length === 0") 空空如也~
            label(v-for="(article, index) in getSelectedArticles")
              button.btn.btn-xs.btn-default(@click="removeFromArr(selectedArticlesId, index)") 移除
              div.content-position.selected-content-position
                a.title(:href="article.url" target="_blank") {{article.t}}
                div.content
                  span.source {{source[article.source]}}
                  span.toc(:title="detailedTime(article.toc)") {{fromNow(article.toc)}}
                  span {{article.c}}

    //button.btn.btn-default(@click="close") 关闭
</template>
<style lang="less" scoped>
@import "../../../../publicModules/base";
.selector-core {
  background-color: #ffffff;
  .selector-core-header{
    padding: 1rem 1rem 0 1rem;
  }
  .selected-table {
    .selected-table-span {
      .selected-count{
        height: 1.4rem;
        padding: 0 0.45rem;
        line-height: 1.4rem;
        text-align: center;
        background-color: rgba(255, 0, 0, 0.6);
        border-radius: 0.7rem;
        font-size: 1rem;
        color: #fff;
      }
    }
  }
  .selected-search{
    position: relative;
    width: 16.5rem;
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
  .search-clear{
    position: absolute;
  }
  .search-input{
    padding-right: 34px;
    border-radius: 0 4px 4px 0;
  }
  }
  .selector-core-body {
    padding-left: 1rem;
    padding-right: 1rem;
    .articles {
      height: 400px;
      overflow-y: auto;
      background-color: #eceeef;
      label {
      &:hover{
        background-color: #d9dfe3;
      }
    }
    }
    label {
      display: block;
      position: relative;
      // &:hover{
      //   background-color: #d9dfe3;
      // }
      input {
        position: absolute;
      }
      button {
        position: absolute;
        top: 0.6rem;
        left: 0;
        cursor: pointer;
      }
    }
    .content-position {
      position: relative;
      padding-left: 2rem;
      display: inline-block;
      padding-right: 1rem;
      font-weight: normal;
      .title {
        font-size: 1.2rem;
        color: @primary;
      }
      .content {
        color: #555;
        .source {
          font-size: 12px;
          padding-right: 0.5rem;
          color: #838383;
        }
        .toc{
          font-size: 1.2rem;
          color: @accent;
          margin-right: 0.5rem;
        }
        .hideText(@line: 1);
      }
    }
    .selected-content-position{
      padding-left: 4rem;
    }
  }
}
.relative {
  position: relative;
}
.absolute {
  position: absolute;
  top: -8px;
  right: -8px;
}
</style>
<script>
import Paging from "../../Paging";
import {nkcAPI} from "../../../js/netAPI";
import {timeFormat, detailedTime} from "../../../js/time";
import {fromNow} from "../../../js/tools";
export default {
  props:{
    articleSource:{
      require: true,
      type: Array,
      default: () => ['zone', 'column']
    }
  },
  data: () => ({
    selectedSource: 'threads',
    searchStatus:false,
    selectedArticles: [],
    selectedArticlesId: [],
    articles: [],
    paging: {},
    number: 0,
    loading: true,
    keyword:'',
    searchKeyword:'',
    source: {
      'thread': '论坛',
      'zone': '电波',
      'column': '专栏',
    }
  }),
  components:{
    "paging": Paging,
  },
  computed: {
    pageButtons() {
      return this.paging && this.paging.buttonValue? this.paging.buttonValue: [];
    },
    selectedArticlesObj() {
      let obj = {};
      this.selectedArticles.forEach(item=>{
        obj[item.tid] = item
      })
      return obj;
    },
    getSelectedArticles(){
      return this.selectedArticlesId.map(item=>{
        return this.selectedArticlesObj[item];
      });
    },
    articlesObj(){
      const articlesId = this.articles.map(item=>{
        return item.tid;
      });
      return {
        articlesId
      }
    },
    //判断是否全选
    isAllChecked() {
      let type = true;
      const article = this.articles.find(item=>{
        return !this.selectedArticlesId.includes(item.tid)
      })
      if(this.articles.length === 0 || article){
        type = false;
      }
      return type;
    }
  },
  watch:{
    keyword: {
      handler(newValue) {
        if(!newValue.trim()&&this.searchStatus){
          this.clear();
        }
      },
    },
  },
  methods:{
    fromNow,
    detailedTime,
    timeFormat: timeFormat,
    getNumber() {
      this.number += 1;
      return this.number;
    },
    removeFromArr(arr, index) {
      arr.splice(index, 1);
    },
    getUserArticles(page) {
      const self= this;
      let url;
      if(this.selectedSource === 'threads') {
        url = `/api/v1/threads/selector?page=${page}`;
      } else {
        url = `/api/v1/articles/selector?page=${page}&selectedSource=${this.selectedSource}`;
      }
      const number = this.getNumber();
      nkcAPI(url, "GET")
        .then(res => {
          if(this.number === number) {
            this.loading = false
            self.paging = res.data.paging;
            self.articles = res.data.articles;
          }
        })
        .catch(err => {
          sweetError(err);
        })
    },
    //点击分页
    clickButton(num) {
      this.getUserArticles(num);
    },
    // 保存选过的
    selectedArticlesFunc(article){
      if(!this.selectedArticlesObj[article.tid]){
        this.selectedArticles.push(article)
      }
    },
    selectedAllArticlesFunc() {
      if(!this.isAllChecked){
        const set = new Set(this.selectedArticlesId);
        this.articles.forEach(item => {
          set.add(item.tid)
          this.selectedArticlesFunc(item)
        })
        this.selectedArticlesId = [...set]
      } else {
        this.selectedArticlesId = this.selectedArticlesId.filter(item=>{
          return !this.articlesObj.articlesId.includes(item)
        })
      }
    },
    // 点击切换文章来源
    selectSource(source){
      this.selectedSource = source;
      if(source!=='choose'){
        this.getUserArticles(0);
        this.searchStatus =false;
      }
    },
    init(){
      this.selectedSource= 'threads';
      this.selectedArticles= [];
      this.selectedArticlesId= [];
      this.articles= [];
      this.paging= {};
      this.loading = true;
      this.keyword = '';
      this.getUserArticles(0);

    },
    search(){
      const self= this;
      if(!self.keyword.trim()){
        this.clear()
        return;
      }
      this.searchStatus = true;
      this.searchKeyword = self.keyword.trim();
      let url;
      if(this.selectedSource === 'threads') {
        url = `/api/v1/threads/selector/search?t=${self.keyword}`;
      } else {
        url = `/api/v1/articles/selector/search?t=${self.keyword}&selectedSource=${this.selectedSource}`;
      }
      const number = this.getNumber();
      nkcAPI(url, "GET")
        .then(res => {
          if(this.number === number) {
            this.loading = false;
            self.articles = res.data.articles;
          }
        })
        .catch(err => {
          sweetError(err);
        })
    },
    clear(){
      this.keyword= '';
      if(!this.searchStatus){
        return;
      }
      this.searchStatus = false;
      this.getUserArticles(0);
    }
  }
}
</script>
