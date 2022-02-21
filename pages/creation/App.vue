<template lang="pug">
  .creation-center
    .creation-nav-container
      creation-nav(@select="selectNavItem")
    .creation-content-container
      transition(:name="transitionName")
        router-view
</template>
<script>
  import Nav from './components/Nav';
  export default {
    components: {
      'creation-nav': Nav
    },
    data: () => ({
      transitionName: 'fade'
    }),
    watch: {
      $route (to, from) {
        const toDepth = to.path.split('/').length
        const fromDepth = from.path.split('/').length
        this.transitionName = toDepth < fromDepth ? 'fade' : 'fade'
      }
    },
    methods: {
      navToPage(page) {
        this.$router.push({name: page});
      },
      selectNavItem(type) {
        console.log(`selectNavItem:`, type);
        this.navToPage(type);
      }
    }
  }
</script>
<style lang="less" scoped>
  @import '../publicModules/base';
  @leftNavWidth: 16rem;
  @paddingTop: 4rem;
  .creation-nav-container{
    position: fixed;
    background-color: #fff;
    height: 100%;
    top: 0;
    padding-top: @paddingTop + 1rem;
    left: 0;
    width: @leftNavWidth;
    border-right: 1px solid #ddd;
  }
  .creation-center{
    padding-left: @leftNavWidth;
  }
</style>
