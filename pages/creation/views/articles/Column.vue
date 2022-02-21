<template lang="pug">
  .articles-column 专栏文章
</template>

<style lang="less" scoped>

</style>

<script>
  import {nkcAPI} from '../../../lib/js/netAPI';
  import {sweetError} from "../../../lib/js/sweetAlert";

  export default {
    data: () => ({

    }),
    mounted() {
      this.getArticles();
    },
    methods: {
      getArticles(page = 0) {
        nkcAPI(`/creation/articles/column?page=${page}`, 'GET')
          .then(res => {

          })
          .catch(sweetError);
      }
    }
  }
</script>