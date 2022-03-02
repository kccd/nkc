<template lang="pug">
  .moment 动态列表
</template>

<script>
  import {nkcAPI} from '../../../lib/js/netAPI';
  import {sweetError} from '../../../lib/js/sweetAlert';
  export default {
    data: () => ({
      moments: []
    }),
    mounted() {
      this.getMoments();
    },
    methods: {
      getMoments(page = 0) {
        const self = this;
        nkcAPI(`/creation/zone/moment?page=${page}`, 'GET')
          .then(res => {
            console.log(res);
            self.moments = res.moment;
          })
          .catch(sweetError)
      }
    }
  }
</script>
