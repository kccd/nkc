<template lang="pug">
  div
    ModuleHeader(
      :title="headerTitle"
    )
    div
      p Lorem ipsum dolor sit amet, consectetur
</template>

<style scoped lang="less">

</style>

<script>
  import ModuleHeader from './ModuleHeader.vue';
  export default {
    data: () => ({
      messages: [],
      headerTitle: '离歌笑'
    }),
    components: {
      ModuleHeader
    }
  }
</script>