<template lang="pug">
  .selector-core
    .selector-core-header
      .selected-table.paging-button
        a.selected-table-span.button.radius-left(
          @click.stop='selectSource("threads")'
          :class="{active : selectedSource === 'threads'}"
        ) 社区
        a.selected-table-span.button(
          v-if="articleSource && articleSource.includes('zone')"
          @click.stop='selectSource("zone")'
          :class="{active : selectedSource === 'zone'}"
        ) 空间
        a.selected-table-span.button.radius-right(
          v-if="articleSource && articleSource.includes('column')"
          @click.stop='selectSource("column")'
          :class="{active : selectedSource === 'column'}"
        ) 专栏
        a.selected-table-span.button.m-l-1.relative(
          @click.stop='selectSource("choose")'
          :class="{active : selectedSource === 'choose'}"
        ) 已选泽
          .selected-count.absolute(v-if="getSelectedArticles.length !== 0") {{getSelectedArticles.length}}
    div
      div(v-if="loading" ) 加载中...
      div(v-else)
        .selector-core-body(v-if="selectedSource !== 'choose'" )
          paging(ref="paging" :pages="pageButtons" @click-button="clickButton")
          label
              input(type='checkbox' :checked='isAllChecked' @click="selectedAllArticlesFunc()")
              div.content-position 全选
          .articles
            label.he(v-for="article in articles")
              input(type='checkbox' :value='article.tid' v-model='selectedArticlesId' @click="selectedArticlesFunc(article)")
              div.content-position
                a.title(:href="article.url" target="_blank") {{article.t}}
                div.content
                  span.toc(:title="detailedTime(article.toc)") {{fromNow(article.toc)}}
                  span {{article.c}}
        .selector-core-body(v-else)
          .articles
            label(v-for="article in getSelectedArticles")
              input(type='checkbox' :value='article.tid' v-model='selectedArticlesId' @click="selectedArticlesFunc(article)")
              div.content-position
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
  .selector-core-body {
    padding-left: 1rem;
    .articles {
      height: 400px;
      overflow-y: auto;
    }
    label {
      display: block;
      position: relative;
      &:hover{
        background-color: #eee;
      }
      input {
        position: absolute;
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
  }
}
.he {
  height: 400px
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
    selectedArticles: [],
    selectedArticlesId: [],
    articles: [],
    paging: {},
    number: 0,
    loading: true,
    allChecked: false,
    source: {
      'thread': '社区',
      'zone': '空间',
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
  methods:{
    fromNow,
    detailedTime,
    timeFormat: timeFormat,
    getNumber() {
      this.number += 1;
      return this.number;
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
            this.allChecked = this.isAllChecked;
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
      if(!this.allChecked){
        this.allChecked = true;
        const set = new Set(this.selectedArticlesId);
        this.articles.forEach(item => {
          set.add(item.tid)
          this.selectedArticlesFunc(item)
        })
        this.selectedArticlesId = [...set]
      } else {
        this.allChecked = false;
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
      }
    },
    init(){
      this.selectedSource= 'threads';
      this.selectedArticles= [];
      this.selectedArticlesId= [];
      this.articles= [];
      this.paging= {};
      this.loading = true;
      this.getUserArticles(0);

    }
  }
}
</script>
