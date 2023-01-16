<template lang="pug">
  .selector-core
    .selector-core-header
      .selected-table
        .selected-table-span(
          @click.stop='selectSource("threads")'
          :class="{active : selectedSource === 'threads'}"
        ) 社区文章
        .selected-table-span(
          @click.stop='selectSource("articles")'
          :class="{active : selectedSource === 'articles'}"
        ) 空间或专栏文章
        .selected-table-span(
          @click.stop='selectSource("choose")'
          :class="{active : selectedSource === 'choose'}"
        ) 已选泽
    .selector-core-body(v-if="selectedSource !== 'choose'" )
      paging(ref="paging" :pages="pageButtons" @click-button="clickButton")
      .articles
        label(v-for="article in articles")
          input(type='checkbox' :value='article.tid' v-model='selectedArticlesId' @click="selectedArticlesFunc(article)")
          div.content-position
            div.title {{article.t}}
            div.content
              span.toc(:title="detailedTime(article.toc)") {{fromNow(article.toc)}}
              span {{article.c}}
    .selector-core-body(v-else)
      .articles
        label(v-for="article in getSelectedArticles()")
          input(type='checkbox' :value='article.tid' v-model='selectedArticlesId' @click="selectedArticlesFunc(article)")
          div.content-position
            div.title {{article.t}}
            div.content
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
      display: inline-block;
      box-sizing: border-box;
      height: 2.6rem;;
      line-height: 2.6rem;;
      padding: 0 1rem;
      background-color: #fff;
      border: 1px solid #aaa;
      border-radius: 3px;
      color: #555;
      margin: 0 0.8rem 0.8rem 0;
      cursor: pointer;
    }
    .active {
      color: #fff;
      background-color: @primary;
      border-color: @primary;
    }
  }
  .selector-core-body {
    padding-left: 1rem;
    max-height: 450px;
    overflow-y: auto;
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
      .content{
        color: #555;
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
  },
  methods:{
    fromNow,
    detailedTime,
    timeFormat: timeFormat,
    close() {
      this.$emit('close');
    },
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
        url = `/api/v1/articles/selector?page=${page}&articleSource=${JSON.stringify(this.articleSource)}`;
      }
      const number = this.getNumber();
      nkcAPI(url, "GET")
        .then(res => {
          if(this.number === number) {
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
    getSelectedArticles(){
      return this.selectedArticlesId.map(item=>{
        return this.selectedArticlesObj[item];
      });
    },
    // 点击文章来源
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
      this.getUserArticles(0);

    }
  }
}
</script>
