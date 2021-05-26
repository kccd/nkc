<template lang="pug">
  div.aaa
    h2 Message Component
    PageList
</template>

<style scoped lang="less">

</style>

<script>

  import PageList from './components/PageList.vue';

  export default {
    data: () => ({
      // 页面名称
      pageName: 'list', // list, message, setting
      // 列表名称
      listName: 'chat', // chat, user, category

    }),
    components: {
      PageList
    },
    mounted() {

    },
    methods: {

    }
  }
</script>