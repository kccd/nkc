<template lang="pug">
  .moments
    .moment-container(:key="momentData.momentId" v-for="momentData in moments")
      moment(:data="momentData")
</template>

<style lang="less" scoped>
  .moment-container{
    border-bottom: 1px solid #eee;
    padding-bottom: 0.3rem;
    margin-bottom: 1.5rem;
  }
</style>

<script>
  import Moment from './Moment';
  export default {
    props: ['moments'],
    components: {
      'moment': Moment,
    },
    data: () => ({

    }),
  }
</script>