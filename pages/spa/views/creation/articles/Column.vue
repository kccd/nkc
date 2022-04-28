<template lang="pug">
  .articles-column
    paging(:pages="pages" @click-button="selectPageCount")
    articles-list(:articles="articlesList")
</template>

<style lang="less" scoped>

</style>

<script>
  import {nkcAPI} from '../../../../lib/js/netAPI';
  import {sweetError} from "../../../../lib/js/sweetAlert";
  import Paging from '../../../../lib/vue/Paging';
  import ArticlesList from '../../../components/ArticlesList';
  export default {
    data: () => ({
      pages: [],
      articlesList: []
    }),
    components: {
      paging: Paging,
      'articles-list': ArticlesList,
    },
    mounted() {
      this.getArticles();
    },
    methods: {
      getArticles(page = 0) {
        const self = this;
        nkcAPI(`/creation/articles/column?page=${page}`, 'GET')
          .then(res => {
            self.pages = res.paging.buttonValue;
            self.articlesList = res.articlesList;
          })
          .catch(sweetError);
      },
      selectPageCount(num) {
        this.getArticles(num);
      }
    }
  }
</script>
