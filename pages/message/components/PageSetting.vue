<template lang="pug">
  .page-setting
    ModuleHeader(
      :leftIcon="'fa fa-angle-left'"
      @onClickLeftButton="closePage"
    )
    .page-setting-container
      p Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aperiam blanditiis dicta doloremque doloribus facere laudantium minus, nam natus nihil obcaecati omnis optio pariatur provident quae quo repellendus saepe similique tempore!
</template>

<style lang="less" scoped>

</style>

<script>
  import ModuleHeader from './ModuleHeader.vue';
  import {closePage} from '../message.2.0.js';
  export default {
    data: () => ({

    }),
    components: {
      ModuleHeader
    },
    methods: {
      closePage() {
        closePage(this);
      }
    }
  }
</script>