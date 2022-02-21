<template lang="pug">
  .articles-column
    paging(:pages="pages" @click-button="selectPageCount")
</template>

<style lang="less" scoped>

</style>

<script>
  import {nkcAPI} from '../../../lib/js/netAPI';
  import {sweetError} from "../../../lib/js/sweetAlert";
  import Paging from '../../../lib/vue/Paging';

  export default {
    data: () => ({
      pages: [],
    }),
    components: {
      paging: Paging
    },
    mounted() {
      this.getArticles();
    },
    methods: {
      getArticles(page = 0) {
        const self = this;
        nkcAPI(`/creation/articles/column?page=${page}`, 'GET')
          .then(res => {
            console.log(res);
            self.pages = res.paging.buttonValue;
          })
          .catch(sweetError);
      },
      selectPageCount(num) {
        this.getArticles(num);
      }
    }
  }
</script>