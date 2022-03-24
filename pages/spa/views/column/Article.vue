<template lang="pug">
  .column-article
    paging(:pages="pages" @click-button="selectPageCount")
    blank(v-if="articlesList.length === 0" :height="'20rem'")
    articles-list(:articles="articlesList" @delete="deleteItem")
    paging(:pages="pages" @click-button="selectPageCount")
</template>

<script>
  import {nkcAPI} from '../../../lib/js/netAPI';
  import {sweetError} from "../../../lib/js/sweetAlert";
  import Paging from '../../../lib/vue/Paging';
  import ArticlesList from '../../components/ArticlesList';
  import Blank from '../../components/Blank';
  export default {
    data: () => ({
      pages: [],
      articlesList: []
    }),
    components: {
      paging: Paging,
      blank: Blank,
      'articles-list': ArticlesList,
    },
    mounted() {
      this.initData();
    },
    watch: {
      $route() {
        this.initData();
      }
    },
    methods: {
      getQueryPage() {
        return this.$route.query.page || 0;
      },
      initData() {
        const page = this.getQueryPage();
        this.getArticles(page).catch(sweetError);
      },
      /*
      * 获取文章列表信息
      * @param {Number} page 页数（默认为 0）
      * */
      getArticles(page = 0) {
        const self = this;
        return nkcAPI(`/creation/column/article?page=${page}`, 'GET')
          .then(res => {
            self.pages = res.paging.buttonValue;
            self.articlesList = res.articlesList;
          });
      },
      // 点击页码
      selectPageCount(num) {
        this.$router.push({
          name: this.$route.name,
          query: {
            page: num
          }
        });
      },
      deleteItem(index) {
        this.articlesList.splice(index, 1);
      }
    }
  }
</script>