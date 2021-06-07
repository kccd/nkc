<template lang="pug">
  .page-search
    ModuleHeader(
      :title="'搜索用户'"
      :leftIcon="'fa fa-angle-left'"
      @onClickLeftButton="sendEvent('closePage')"
    )
    .page-search-container

</template>

<style lang="less" scoped>
  @import "../message.2.0.less";
  .page-search-container{
    height: @containerHeight;
  }
</style>

<script>
  import ModuleHeader from './ModuleHeader.vue';
  import {closePage} from '../message.2.0.js';
  export default {
    data: () => ({

    }),
    methods: {
      sendEvent(type, props) {
        if(type === 'closePage') {
          closePage(this)
        }
      }
    },
    components: {
      ModuleHeader,
    }
  }
</script>