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
    .selector-core-body
      paging(ref="paging" :pages="pageButtons" @click-button="clickButton")
      .articles
          label(v-for="article in articles")
            input(type='checkbox' :value='article.id' v-model='selectedArticlesId')
            div.content-position
              div {{article.name}}
              div 来自专业

</template>
<style lang="less" scoped>
@import "../../../../publicModules/base";
.selector-core {
  padding: 0.5rem;
  background-color: #ffffff;
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
    label {
      display: block;
      .content-position {
        position: relative;
        left: 1.5rem;
        top: -2.5rem;
      }
    }
  }
}
</style>
<script>
import Paging from "../../Paging";
import {nkcAPI} from "../../../js/netAPI";

export default {
  data: () => ({
    selectedSource: 'threads',
    selectedArticles: [],
    selectedArticlesId: [],
    articles: [{id:1,name:1},{id:2,name:2},{id:3,name:1},{id:4,name:1}],
    paging: {},

  }),
  components:{
    "paging": Paging,
  },
  computed: {
    pageButtons() {
      return this.paging && this.paging.buttonValue? this.paging.buttonValue: [];
    },
  },
  mounted() {
    console.log('11')
    // this.getUserArticles(0);
  },
  methods:{
    getUserArticles(page) {
      const self= this;
      let url;
      if(this.selectedSource === 'threads') {
        url = `/api/v1/threads/selector`;
      } else {
        url = `/api/v1/articles/selector`;
      }
      nkcAPI(url, "GET")
        .then(res => {
          self.paging = res.paging;

        })
        .catch(err => {
          sweetError(err);
        })
    },
    //点击分页
    clickButton(num) {
      this.getUserArticles(num);
    },
    getSelectedArticles(){
      return this.selectedArticles
    },
    selectSource(source){
      this.selectedSource = source;
    },
  }
}
</script>
