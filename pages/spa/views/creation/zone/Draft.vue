<template lang="pug">
  .zone-draft
    paging(:pages="pages" @click-button="selectPageCount")
    blank(v-if="articlesDraftList.length === 0" :height="'20rem'")
    articles-draft-list(:drafts="articlesDraftList" @delete="deleteItem")
    paging(:pages="pages" @click-button="selectPageCount")
</template>

<script>
import {nkcAPI} from '../../../../lib/js/netAPI';
import {sweetError} from "../../../../lib/js/sweetAlert";
import Paging from '../../../../lib/vue/Paging';
import ArticlesDraftList from '../../../components/ArticlesDraftList';
import Blank from '../../../components/Blank.vue'
export default {
  data: () => ({
    pages: [],
    articlesDraftList: []
  }),
  components: {
    paging: Paging,
    blank: Blank,
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
      return nkcAPI(`/creation/zone/draft?page=${page}`, 'GET')
        .then(res => {
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
    },
    deleteItem(index) {
      this.articlesDraftList.splice(index, 1);
    }
  }
}
</script>
