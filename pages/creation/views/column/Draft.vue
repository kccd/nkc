<template lang="pug">
  .column-draft
    paging(:pages="pages" @click-button="selectPageCount")
    articles-draft-list(:drafts="articlesDraftList")
    paging(:pages="pages" @click-button="selectPageCount")
</template>

<script>
import {nkcAPI} from '../../../lib/js/netAPI';
import {sweetError} from "../../../lib/js/sweetAlert";
import Paging from '../../../lib/vue/Paging';
import ArticlesDraftList from '../../components/ArticlesDraftList';
export default {
  data: () => ({
    pages: [],
    articlesDraftList: []
  }),
  components: {
    paging: Paging,
    'articles-draft-list': ArticlesDraftList,
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
      this.getArticlesDraft(page).catch(sweetError);
    },
    /*
    * 获取文章列表信息
    * @param {Number} page 页数（默认为 0）
    * */
    getArticlesDraft(page = 0) {
      const self = this;
      return nkcAPI(`/creation/column/draft?page=${page}`, 'GET')
        .then(res => {
          console.log(res.articlesDraftList);
          self.pages = res.paging.buttonValue;
          self.articlesDraftList = res.articlesDraftList;
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
    }
  }
}
</script>