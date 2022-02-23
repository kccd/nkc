<template lang="pug">
  .creation-center
    .creation-nav-container
      creation-nav(@select="selectNavItem")
    .creation-content-container
      transition(:name="transitionName")
        router-view
</template>
<script>
  import VerNav from './components/VerNav';
  export default {
    components: {
      'creation-nav': VerNav
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
        this.navToPage(type);
      }
    }
  }
</script>
<style lang="less" scoped>
  @import '../publicModules/base';
  @leftNavWidth: 20rem;
  @paddingTop: 5rem;
  .creation-nav-container{
    position: fixed;
    background-color: #fff;
    height: 100%;
    top: 0;
    padding-top: @paddingTop + 1rem;
    left: 0;
    width: @leftNavWidth;
  }
  .creation-center{
    padding-top: 2rem;
    padding-left: @leftNavWidth;
  }
</style>
