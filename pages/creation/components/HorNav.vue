<template lang="pug">
  .hor-nav
    .hor-nav-item(
      v-for="item in navList"
      @click="selectNav(item)"
      :class="selectedNavType.includes(item.type)? 'active': ''"
    ) {{item.title}}
</template>
<style lang="less" scoped>
  @import '../../publicModules/base';
  .hor-nav{
    @max-width: 1000px;
    @media screen and (max-width: max-width) {
      margin-left: 1rem;
    }
    margin-bottom: 1rem;
    user-select: none;
    .hor-nav-item{
      display: inline-block;
      height: 2.5rem;
      line-height: 2.5rem;
      padding: 0;
      margin: 0 2rem 1rem 0;
      font-size: 1.3rem;
      cursor: pointer;
      &.active{
        border-bottom: 2px solid @accent;
      }
      &:active{
        opacity: 0.7;
      }
    }
  }
</style>
<script>
  export default {
    props: ['list'],
    data: () => ({
      selectedNavType: [],
      navList: []
    }),
    watch: {
      $route: 'setActiveNavType'
    },
    mounted() {
      this.initData();
    },
    methods: {
      setActiveNavType() {
        const type = [];
        for(const m of this.$route.matched) {
          type.push(m.name);
        }
        this.selectedNavType = type;
      },
      initData() {
        const {list} = this;
        const navList = [];
        for(const item of list) {
          const {type, title} = item;
          navList.push({type, title});
        }
        this.navList = navList;
        this.setActiveNavType();
      },
      selectNav(item) {
        this.$router.replace({
          name: item.type
        });
      }
    }
  }
</script>