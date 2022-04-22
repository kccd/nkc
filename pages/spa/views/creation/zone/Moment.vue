<template lang="pug">
  .moment
    paging(:pages="pages" :mb="1" @click-button="onSelectPage")
    moments(:moments="momentsData")
    paging(:pages="pages" @click-button="onSelectPage")
</template>
<style lang="less">
  .moment{
    width: 56rem;
    max-width: 100%;
    .moment-quote-title{
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }
  }
</style>
<script>
  import {nkcAPI} from '../../../../lib/js/netAPI';
  import {sweetError} from '../../../../lib/js/sweetAlert';
  import Paging from '../../../../lib/vue/Paging';
  import Moments from '../../../../lib/vue/zone/Moments';
  export default {
    components: {
      'paging': Paging,
      'moments': Moments,
    },
    data: () => ({
      momentsData: [],
      pages: []
    }),
    mounted() {
      this.getMoments();
    },
    methods: {
      onSelectPage(num) {
        this.getMoments(num)
      },
      getMoments(page = 0) {
        const self = this;
        nkcAPI(`/creation/zone/moment?page=${page}`, 'GET')
          .then(res => {
            self.momentsData = res.momentsData;
            self.pages = res.paging.buttonValue;
          })
          .catch(sweetError)
      }
    }
  }
</script>
